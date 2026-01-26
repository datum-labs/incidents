package incident

import (
	"context"
	"fmt"
	"sync"

	"k8s.io/apimachinery/pkg/api/errors"
	metainternalversion "k8s.io/apimachinery/pkg/apis/meta/internalversion"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apiserver/pkg/registry/rest"
	"k8s.io/klog/v2"

	"go.miloapis.com/incidents/internal/grafana/irm"
	"go.miloapis.com/incidents/pkg/apis/incidents/v1alpha1"
)

var _ rest.Storage = &Storage{}
var _ rest.Scoper = &Storage{}
var _ rest.Getter = &Storage{}
var _ rest.Lister = &Storage{}
var _ rest.Creater = &Storage{}
var _ rest.Updater = &Storage{}
var _ rest.GracefulDeleter = &Storage{}

// Storage implements rest.Storage for Incidents backed by Grafana IRM.
type Storage struct {
	irmClient *irm.Client
	strategy  Strategy

	// nameToID maps Kubernetes names to Grafana IRM incident IDs
	nameToID sync.Map
}

// NewStorage creates a new Storage for Incidents.
func NewStorage(irmClient *irm.Client, typer runtime.ObjectTyper) *Storage {
	return &Storage{
		irmClient: irmClient,
		strategy:  NewStrategy(typer),
	}
}

// New returns an empty Incident object.
func (s *Storage) New() runtime.Object {
	return &v1alpha1.Incident{}
}

// Destroy cleans up resources on shutdown.
func (s *Storage) Destroy() {}

// NamespaceScoped returns false because Incidents are cluster-scoped.
func (s *Storage) NamespaceScoped() bool {
	return false
}

// GetSingularName returns the singular name of the resource.
func (s *Storage) GetSingularName() string {
	return "incident"
}

// NewList returns an empty IncidentList object.
func (s *Storage) NewList() runtime.Object {
	return &v1alpha1.IncidentList{}
}

// Get retrieves an Incident by name.
func (s *Storage) Get(ctx context.Context, name string, options *metav1.GetOptions) (runtime.Object, error) {
	// Look up the incident ID from the name
	incidentID, err := s.getIncidentIDByName(ctx, name)
	if err != nil {
		return nil, err
	}

	resp, err := s.irmClient.Incidents().Get(ctx, incidentID)
	if err != nil {
		klog.Errorf("Failed to get incident %s from Grafana IRM: %v", incidentID, err)
		return nil, errors.NewInternalError(fmt.Errorf("failed to get incident from Grafana IRM: %w", err))
	}

	incident := FromGrafanaIncident(&resp.Incident)
	// Override name with the requested name to maintain consistency
	incident.Name = name

	return incident, nil
}

// List returns a list of Incidents.
func (s *Storage) List(ctx context.Context, options *metainternalversion.ListOptions) (runtime.Object, error) {
	req := &irm.QueryIncidentsRequest{
		Query: &irm.IncidentQuery{
			Limit:          100, // Default limit
			OrderDirection: "DESC",
		},
	}

	resp, err := s.irmClient.Incidents().Query(ctx, req)
	if err != nil {
		klog.Errorf("Failed to list incidents from Grafana IRM: %v", err)
		return nil, errors.NewInternalError(fmt.Errorf("failed to list incidents from Grafana IRM: %w", err))
	}

	list := &v1alpha1.IncidentList{
		TypeMeta: metav1.TypeMeta{
			APIVersion: v1alpha1.SchemeGroupVersion.String(),
			Kind:       "IncidentList",
		},
		Items: make([]v1alpha1.Incident, 0, len(resp.Incidents)),
	}

	for _, grafanaIncident := range resp.Incidents {
		incident := FromGrafanaIncident(&grafanaIncident)
		// Store the mapping
		s.nameToID.Store(incident.Name, grafanaIncident.IncidentID)
		list.Items = append(list.Items, *incident)
	}

	return list, nil
}

// Create creates a new Incident.
func (s *Storage) Create(ctx context.Context, obj runtime.Object, createValidation rest.ValidateObjectFunc, options *metav1.CreateOptions) (runtime.Object, error) {
	incident, ok := obj.(*v1alpha1.Incident)
	if !ok {
		return nil, errors.NewBadRequest("not an Incident object")
	}

	// Run strategy preparation
	s.strategy.PrepareForCreate(ctx, incident)

	// Validate
	if createValidation != nil {
		if err := createValidation(ctx, obj); err != nil {
			return nil, err
		}
	}

	errs := s.strategy.Validate(ctx, incident)
	if len(errs) > 0 {
		return nil, errors.NewInvalid(v1alpha1.SchemeGroupVersion.WithKind("Incident").GroupKind(), incident.Name, errs)
	}

	// Create in Grafana IRM
	req := ToGrafanaCreateRequest(incident)
	resp, err := s.irmClient.Incidents().Create(ctx, req)
	if err != nil {
		klog.Errorf("Failed to create incident in Grafana IRM: %v", err)
		return nil, errors.NewInternalError(fmt.Errorf("failed to create incident in Grafana IRM: %w", err))
	}

	// Convert response back to Kubernetes object
	result := FromGrafanaIncident(&resp.Incident)

	// Use the provided name if specified
	if incident.Name != "" {
		result.Name = incident.Name
	}

	// Store the mapping
	s.nameToID.Store(result.Name, resp.IncidentID)

	// Assign roles if specified
	for _, role := range incident.Spec.Roles {
		_, err := s.irmClient.Incidents().AssignRole(ctx, &irm.AssignRoleRequest{
			IncidentID: resp.IncidentID,
			Role:       role.Role,
			UserID:     role.UserID,
		})
		if err != nil {
			klog.Warningf("Failed to assign role %s to user %s: %v", role.Role, role.UserID, err)
		}
	}

	return result, nil
}

// Update updates an existing Incident.
func (s *Storage) Update(ctx context.Context, name string, objInfo rest.UpdatedObjectInfo, createValidation rest.ValidateObjectFunc, updateValidation rest.ValidateObjectUpdateFunc, forceAllowCreate bool, options *metav1.UpdateOptions) (runtime.Object, bool, error) {
	// Get the existing incident
	oldObj, err := s.Get(ctx, name, &metav1.GetOptions{})
	if err != nil {
		return nil, false, err
	}
	oldIncident := oldObj.(*v1alpha1.Incident)

	// Apply the update
	newObj, err := objInfo.UpdatedObject(ctx, oldIncident)
	if err != nil {
		return nil, false, err
	}
	newIncident := newObj.(*v1alpha1.Incident)

	// Run strategy preparation
	s.strategy.PrepareForUpdate(ctx, newIncident, oldIncident)

	// Validate
	if updateValidation != nil {
		if err := updateValidation(ctx, newIncident, oldIncident); err != nil {
			return nil, false, err
		}
	}

	errs := s.strategy.ValidateUpdate(ctx, newIncident, oldIncident)
	if len(errs) > 0 {
		return nil, false, errors.NewInvalid(v1alpha1.SchemeGroupVersion.WithKind("Incident").GroupKind(), name, errs)
	}

	// Get the incident ID
	incidentID := oldIncident.Status.IncidentID
	if incidentID == "" {
		return nil, false, errors.NewInternalError(fmt.Errorf("incident has no incident ID"))
	}

	// Update in Grafana IRM
	req := ToGrafanaUpdateRequest(newIncident, incidentID)
	resp, err := s.irmClient.Incidents().Update(ctx, req)
	if err != nil {
		klog.Errorf("Failed to update incident in Grafana IRM: %v", err)
		return nil, false, errors.NewInternalError(fmt.Errorf("failed to update incident in Grafana IRM: %w", err))
	}

	// Convert response back to Kubernetes object
	result := FromGrafanaIncident(&resp.Incident)
	result.Name = name

	return result, false, nil
}

// Delete resolves an Incident (soft delete).
func (s *Storage) Delete(ctx context.Context, name string, deleteValidation rest.ValidateObjectFunc, options *metav1.DeleteOptions) (runtime.Object, bool, error) {
	// Get the existing incident
	obj, err := s.Get(ctx, name, &metav1.GetOptions{})
	if err != nil {
		return nil, false, err
	}
	incident := obj.(*v1alpha1.Incident)

	// Validate
	if deleteValidation != nil {
		if err := deleteValidation(ctx, obj); err != nil {
			return nil, false, err
		}
	}

	// Get the incident ID
	incidentID := incident.Status.IncidentID
	if incidentID == "" {
		return nil, false, errors.NewInternalError(fmt.Errorf("incident has no incident ID"))
	}

	// Resolve the incident (soft delete)
	resp, err := s.irmClient.Incidents().Resolve(ctx, incidentID)
	if err != nil {
		klog.Errorf("Failed to resolve incident in Grafana IRM: %v", err)
		return nil, false, errors.NewInternalError(fmt.Errorf("failed to resolve incident in Grafana IRM: %w", err))
	}

	// Remove from name mapping
	s.nameToID.Delete(name)

	// Convert response back to Kubernetes object
	result := FromGrafanaIncident(&resp.Incident)
	result.Name = name

	return result, true, nil
}

// ConvertToTable converts the object to a table for display.
func (s *Storage) ConvertToTable(ctx context.Context, obj runtime.Object, tableOptions runtime.Object) (*metav1.Table, error) {
	return rest.NewDefaultTableConvertor(v1alpha1.Resource("incidents")).ConvertToTable(ctx, obj, tableOptions)
}

// getIncidentIDByName retrieves the Grafana IRM incident ID for a given Kubernetes name.
func (s *Storage) getIncidentIDByName(ctx context.Context, name string) (string, error) {
	// Check if we have a cached mapping
	if id, ok := s.nameToID.Load(name); ok {
		return id.(string), nil
	}

	// Try to find the incident by querying Grafana IRM
	resp, err := s.irmClient.Incidents().Query(ctx, &irm.QueryIncidentsRequest{
		Query: &irm.IncidentQuery{
			Limit:          100,
			OrderDirection: "DESC",
		},
	})
	if err != nil {
		return "", err
	}

	// Search for the incident by name
	for _, incident := range resp.Incidents {
		incidentName := toKubernetesName(incident.Title)
		s.nameToID.Store(incidentName, incident.IncidentID)
		if incidentName == name {
			return incident.IncidentID, nil
		}
	}

	return "", errors.NewNotFound(v1alpha1.Resource("incidents"), name)
}
