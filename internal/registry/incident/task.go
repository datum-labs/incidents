package incident

import (
	"context"
	"fmt"

	"k8s.io/apimachinery/pkg/api/errors"
	metainternalversion "k8s.io/apimachinery/pkg/apis/meta/internalversion"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apiserver/pkg/registry/rest"
	"k8s.io/klog/v2"

	"go.miloapis.com/incidents/internal/grafana/irm"
	"go.miloapis.com/incidents/pkg/apis/incidents/v1alpha1"
)

var _ rest.Storage = &TaskStorage{}
var _ rest.Scoper = &TaskStorage{}
var _ rest.Getter = &TaskStorage{}
var _ rest.Lister = &TaskStorage{}
var _ rest.Creater = &TaskStorage{}
var _ rest.Updater = &TaskStorage{}
var _ rest.GracefulDeleter = &TaskStorage{}

// TaskStorage implements rest.Storage for IncidentTasks backed by Grafana IRM.
type TaskStorage struct {
	irmClient       *irm.Client
	incidentStorage *Storage
}

// NewTaskStorage creates a new TaskStorage.
func NewTaskStorage(irmClient *irm.Client, incidentStorage *Storage) *TaskStorage {
	return &TaskStorage{
		irmClient:       irmClient,
		incidentStorage: incidentStorage,
	}
}

// New returns an empty IncidentTask object.
func (s *TaskStorage) New() runtime.Object {
	return &v1alpha1.IncidentTask{}
}

// Destroy cleans up resources on shutdown.
func (s *TaskStorage) Destroy() {}

// NamespaceScoped returns false because IncidentTasks are cluster-scoped.
func (s *TaskStorage) NamespaceScoped() bool {
	return false
}

// GetSingularName returns the singular name of the resource.
func (s *TaskStorage) GetSingularName() string {
	return "incidenttask"
}

// NewList returns an empty IncidentTaskList object.
func (s *TaskStorage) NewList() runtime.Object {
	return &v1alpha1.IncidentTaskList{}
}

// Get retrieves an IncidentTask by name (task ID).
func (s *TaskStorage) Get(ctx context.Context, name string, options *metav1.GetOptions) (runtime.Object, error) {
	// Tasks don't have direct lookup by ID without incident context
	// This would need enhanced logic to find the task
	return nil, errors.NewNotFound(v1alpha1.Resource("incidenttasks"), name)
}

// List returns a list of IncidentTasks for a given incident.
func (s *TaskStorage) List(ctx context.Context, options *metainternalversion.ListOptions) (runtime.Object, error) {
	// Extract incident name from field selector
	incidentName := ""
	if options.FieldSelector != nil {
		if val, found := options.FieldSelector.RequiresExactMatch("spec.incidentName"); found {
			incidentName = val
		}
	}

	if incidentName == "" {
		return nil, errors.NewBadRequest("spec.incidentName field selector is required")
	}

	// Get the incident ID
	incidentID, err := s.incidentStorage.getIncidentIDByName(ctx, incidentName)
	if err != nil {
		return nil, err
	}

	// Query tasks from Grafana IRM
	resp, err := s.irmClient.Tasks().Query(ctx, &irm.QueryTasksRequest{
		IncidentID: incidentID,
		Limit:      100,
	})
	if err != nil {
		klog.Errorf("Failed to list tasks from Grafana IRM: %v", err)
		return nil, errors.NewInternalError(fmt.Errorf("failed to list tasks from Grafana IRM: %w", err))
	}

	list := &v1alpha1.IncidentTaskList{
		TypeMeta: metav1.TypeMeta{
			APIVersion: v1alpha1.SchemeGroupVersion.String(),
			Kind:       "IncidentTaskList",
		},
		Items: make([]v1alpha1.IncidentTask, 0, len(resp.Tasks)),
	}

	for _, task := range resp.Tasks {
		t := fromGrafanaTask(&task, incidentName)
		list.Items = append(list.Items, *t)
	}

	return list, nil
}

// Create creates a new IncidentTask.
func (s *TaskStorage) Create(ctx context.Context, obj runtime.Object, createValidation rest.ValidateObjectFunc, options *metav1.CreateOptions) (runtime.Object, error) {
	task, ok := obj.(*v1alpha1.IncidentTask)
	if !ok {
		return nil, errors.NewBadRequest("not an IncidentTask object")
	}

	// Validate
	if task.Spec.IncidentName == "" {
		return nil, errors.NewBadRequest("spec.incidentName is required")
	}
	if task.Spec.Text == "" {
		return nil, errors.NewBadRequest("spec.text is required")
	}

	if createValidation != nil {
		if err := createValidation(ctx, obj); err != nil {
			return nil, err
		}
	}

	// Get the incident ID
	incidentID, err := s.incidentStorage.getIncidentIDByName(ctx, task.Spec.IncidentName)
	if err != nil {
		return nil, err
	}

	// Create task in Grafana IRM
	req := &irm.AddTaskRequest{
		IncidentID:     incidentID,
		Text:           task.Spec.Text,
		AssigneeUserID: task.Spec.AssigneeUserID,
	}

	resp, err := s.irmClient.Tasks().Add(ctx, req)
	if err != nil {
		klog.Errorf("Failed to add task in Grafana IRM: %v", err)
		return nil, errors.NewInternalError(fmt.Errorf("failed to add task in Grafana IRM: %w", err))
	}

	// Convert response back to Kubernetes object
	result := fromGrafanaTask(&resp.Task, task.Spec.IncidentName)

	return result, nil
}

// Update updates an existing IncidentTask.
func (s *TaskStorage) Update(ctx context.Context, name string, objInfo rest.UpdatedObjectInfo, createValidation rest.ValidateObjectFunc, updateValidation rest.ValidateObjectUpdateFunc, forceAllowCreate bool, options *metav1.UpdateOptions) (runtime.Object, bool, error) {
	// Get the existing task - we need incident context
	// For now, use the name as the task ID and require incidentName in the update

	// Apply the update
	newObj, err := objInfo.UpdatedObject(ctx, &v1alpha1.IncidentTask{})
	if err != nil {
		return nil, false, err
	}
	newTask := newObj.(*v1alpha1.IncidentTask)

	if newTask.Spec.IncidentName == "" {
		return nil, false, errors.NewBadRequest("spec.incidentName is required")
	}

	// Get the incident ID
	incidentID, err := s.incidentStorage.getIncidentIDByName(ctx, newTask.Spec.IncidentName)
	if err != nil {
		return nil, false, err
	}

	// Use the provided name as the task ID
	taskID := name
	if newTask.Status.TaskID != "" {
		taskID = newTask.Status.TaskID
	}

	// Update task in Grafana IRM
	req := &irm.UpdateTaskRequest{
		IncidentID:     incidentID,
		TaskID:         taskID,
		Text:           newTask.Spec.Text,
		Status:         newTask.Status.Status,
		AssigneeUserID: newTask.Spec.AssigneeUserID,
	}

	resp, err := s.irmClient.Tasks().Update(ctx, req)
	if err != nil {
		klog.Errorf("Failed to update task in Grafana IRM: %v", err)
		return nil, false, errors.NewInternalError(fmt.Errorf("failed to update task in Grafana IRM: %w", err))
	}

	// Convert response back to Kubernetes object
	result := fromGrafanaTask(&resp.Task, newTask.Spec.IncidentName)

	return result, false, nil
}

// Delete deletes an IncidentTask.
func (s *TaskStorage) Delete(ctx context.Context, name string, deleteValidation rest.ValidateObjectFunc, options *metav1.DeleteOptions) (runtime.Object, bool, error) {
	// We need incident context to delete
	// For deletion, we'll need to find the task first
	// This is a simplified implementation - in practice you'd need to track task->incident mapping

	// Return not found since we can't delete without incident context
	return nil, false, errors.NewBadRequest("deletion requires incident context; use kubectl delete with field selector or delete via incident")
}

// ConvertToTable converts the object to a table for display.
func (s *TaskStorage) ConvertToTable(ctx context.Context, obj runtime.Object, tableOptions runtime.Object) (*metav1.Table, error) {
	return rest.NewDefaultTableConvertor(v1alpha1.Resource("incidenttasks")).ConvertToTable(ctx, obj, tableOptions)
}

// fromGrafanaTask converts a Grafana IRM Task to a Kubernetes IncidentTask.
func fromGrafanaTask(task *irm.Task, incidentName string) *v1alpha1.IncidentTask {
	return &v1alpha1.IncidentTask{
		TypeMeta: metav1.TypeMeta{
			APIVersion: v1alpha1.SchemeGroupVersion.String(),
			Kind:       "IncidentTask",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name: task.TaskID,
			Annotations: map[string]string{
				"incidents.operations.miloapis.com/task-id": task.TaskID,
			},
		},
		Spec: v1alpha1.IncidentTaskSpec{
			IncidentName:   incidentName,
			Text:           task.Text,
			AssigneeUserID: task.AssigneeUserID,
		},
		Status: v1alpha1.IncidentTaskStatus{
			TaskID: task.TaskID,
			Status: task.Status,
		},
	}
}
