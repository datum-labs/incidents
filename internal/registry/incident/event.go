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

var _ rest.Storage = &EventStorage{}
var _ rest.Scoper = &EventStorage{}
var _ rest.Getter = &EventStorage{}
var _ rest.Lister = &EventStorage{}
var _ rest.Creater = &EventStorage{}

// EventStorage implements rest.Storage for IncidentEvents backed by Grafana IRM.
type EventStorage struct {
	irmClient       irm.Interface
	incidentStorage *Storage
}

// NewEventStorage creates a new EventStorage.
func NewEventStorage(irmClient irm.Interface, incidentStorage *Storage) *EventStorage {
	return &EventStorage{
		irmClient:       irmClient,
		incidentStorage: incidentStorage,
	}
}

// New returns an empty IncidentEvent object.
func (s *EventStorage) New() runtime.Object {
	return &v1alpha1.IncidentEvent{}
}

// Destroy cleans up resources on shutdown.
func (s *EventStorage) Destroy() {}

// NamespaceScoped returns false because IncidentEvents are cluster-scoped.
func (s *EventStorage) NamespaceScoped() bool {
	return false
}

// GetSingularName returns the singular name of the resource.
func (s *EventStorage) GetSingularName() string {
	return "incidentevent"
}

// NewList returns an empty IncidentEventList object.
func (s *EventStorage) NewList() runtime.Object {
	return &v1alpha1.IncidentEventList{}
}

// Get retrieves an IncidentEvent by name.
func (s *EventStorage) Get(ctx context.Context, name string, options *metav1.GetOptions) (runtime.Object, error) {
	// Events don't have direct lookup by ID in the typical flow
	// This would need the incident name and activity ID
	return nil, errors.NewNotFound(v1alpha1.Resource("incidentevents"), name)
}

// List returns a list of IncidentEvents for a given incident.
func (s *EventStorage) List(ctx context.Context, options *metainternalversion.ListOptions) (runtime.Object, error) {
	// Extract incident name from field selector
	incidentName := ""
	if options.FieldSelector != nil {
		// Try to get incident name from field selector
		// This requires the client to pass ?fieldSelector=spec.incidentName=<name>
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

	// Query activities from Grafana IRM
	resp, err := s.irmClient.Activities().Query(ctx, &irm.QueryActivityRequest{
		Query: &irm.ActivityQuery{
			IncidentID:     incidentID,
			Limit:          100,
			OrderDirection: "DESC",
		},
	})
	if err != nil {
		klog.Errorf("Failed to list activities from Grafana IRM: %v", err)
		return nil, errors.NewInternalError(fmt.Errorf("failed to list activities from Grafana IRM: %w", err))
	}

	list := &v1alpha1.IncidentEventList{
		TypeMeta: metav1.TypeMeta{
			APIVersion: v1alpha1.SchemeGroupVersion.String(),
			Kind:       "IncidentEventList",
		},
		Items: make([]v1alpha1.IncidentEvent, 0, len(resp.ActivityItems)),
	}

	for _, activity := range resp.ActivityItems {
		event := fromGrafanaActivity(&activity, incidentName)
		list.Items = append(list.Items, *event)
	}

	return list, nil
}

// Create creates a new IncidentEvent (adds an activity to an incident).
func (s *EventStorage) Create(ctx context.Context, obj runtime.Object, createValidation rest.ValidateObjectFunc, options *metav1.CreateOptions) (runtime.Object, error) {
	event, ok := obj.(*v1alpha1.IncidentEvent)
	if !ok {
		return nil, errors.NewBadRequest("not an IncidentEvent object")
	}

	// Validate
	if event.Spec.IncidentName == "" {
		return nil, errors.NewBadRequest("spec.incidentName is required")
	}
	if event.Spec.Body == "" {
		return nil, errors.NewBadRequest("spec.body is required")
	}

	if createValidation != nil {
		if err := createValidation(ctx, obj); err != nil {
			return nil, err
		}
	}

	// Get the incident ID
	incidentID, err := s.incidentStorage.getIncidentIDByName(ctx, event.Spec.IncidentName)
	if err != nil {
		return nil, err
	}

	// Create activity in Grafana IRM
	req := &irm.AddActivityRequest{
		IncidentID:   incidentID,
		Body:         event.Spec.Body,
		ActivityKind: event.Spec.EventType,
	}
	if event.Spec.EventTime != nil {
		t := event.Spec.EventTime.Time
		req.EventTime = &t
	}

	resp, err := s.irmClient.Activities().Add(ctx, req)
	if err != nil {
		klog.Errorf("Failed to add activity in Grafana IRM: %v", err)
		return nil, errors.NewInternalError(fmt.Errorf("failed to add activity in Grafana IRM: %w", err))
	}

	// Convert response back to Kubernetes object
	result := fromGrafanaActivity(&resp.ActivityItem, event.Spec.IncidentName)

	return result, nil
}

// ConvertToTable converts the object to a table for display.
func (s *EventStorage) ConvertToTable(ctx context.Context, obj runtime.Object, tableOptions runtime.Object) (*metav1.Table, error) {
	return rest.NewDefaultTableConvertor(v1alpha1.Resource("incidentevents")).ConvertToTable(ctx, obj, tableOptions)
}

// fromGrafanaActivity converts a Grafana IRM Activity to a Kubernetes IncidentEvent.
func fromGrafanaActivity(activity *irm.Activity, incidentName string) *v1alpha1.IncidentEvent {
	event := &v1alpha1.IncidentEvent{
		TypeMeta: metav1.TypeMeta{
			APIVersion: v1alpha1.SchemeGroupVersion.String(),
			Kind:       "IncidentEvent",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name: activity.ActivityItemID,
			Annotations: map[string]string{
				"incidents.operations.miloapis.com/activity-id": activity.ActivityItemID,
			},
			CreationTimestamp: metav1.NewTime(activity.CreatedTime),
		},
		Spec: v1alpha1.IncidentEventSpec{
			IncidentName: incidentName,
			Body:         activity.Body,
			EventType:    activity.ActivityKind,
		},
	}

	if activity.EventTime != nil {
		event.Spec.EventTime = ptrTime(metav1.NewTime(*activity.EventTime))
	}

	return event
}
