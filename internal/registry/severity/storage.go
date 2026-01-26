package severity

import (
	"context"
	"fmt"
	"sync"

	"k8s.io/apimachinery/pkg/api/errors"
	metainternalversion "k8s.io/apimachinery/pkg/apis/meta/internalversion"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apiserver/pkg/registry/rest"

	"go.miloapis.com/incidents/pkg/apis/incidents/v1alpha1"
)

var _ rest.Storage = &Storage{}
var _ rest.Scoper = &Storage{}
var _ rest.Getter = &Storage{}
var _ rest.Lister = &Storage{}
var _ rest.Creater = &Storage{}
var _ rest.Updater = &Storage{}
var _ rest.GracefulDeleter = &Storage{}

// Storage implements rest.Storage for IncidentSeverity using in-memory storage.
// In production, this could be backed by a ConfigMap or etcd.
type Storage struct {
	mu         sync.RWMutex
	severities map[string]*v1alpha1.IncidentSeverity
	strategy   Strategy
}

// NewStorage creates a new Storage for IncidentSeverity with default severities.
func NewStorage(typer runtime.ObjectTyper) *Storage {
	s := &Storage{
		severities: make(map[string]*v1alpha1.IncidentSeverity),
		strategy:   NewStrategy(typer),
	}

	// Initialize with default severity levels
	s.initDefaults()

	return s
}

// initDefaults initializes the default severity levels.
func (s *Storage) initDefaults() {
	defaults := []v1alpha1.IncidentSeverity{
		{
			ObjectMeta: metav1.ObjectMeta{Name: "sev1"},
			Spec: v1alpha1.IncidentSeveritySpec{
				DisplayName: "SEV1 - Critical",
				Description: "Customer-facing outage, immediate response required",
				Color:       "#FF0000",
				Order:       1,
			},
		},
		{
			ObjectMeta: metav1.ObjectMeta{Name: "sev2"},
			Spec: v1alpha1.IncidentSeveritySpec{
				DisplayName: "SEV2 - Major",
				Description: "Significant impact, degraded service",
				Color:       "#FFA500",
				Order:       2,
			},
		},
		{
			ObjectMeta: metav1.ObjectMeta{Name: "sev3"},
			Spec: v1alpha1.IncidentSeveritySpec{
				DisplayName: "SEV3 - Minor",
				Description: "Limited impact, workaround available",
				Color:       "#FFFF00",
				Order:       3,
			},
		},
		{
			ObjectMeta: metav1.ObjectMeta{Name: "sev4"},
			Spec: v1alpha1.IncidentSeveritySpec{
				DisplayName: "SEV4 - Low",
				Description: "Minimal impact, cosmetic issues",
				Color:       "#00FF00",
				Order:       4,
			},
		},
	}

	for i := range defaults {
		sev := defaults[i]
		sev.TypeMeta = metav1.TypeMeta{
			APIVersion: v1alpha1.SchemeGroupVersion.String(),
			Kind:       "IncidentSeverity",
		}
		sev.CreationTimestamp = metav1.Now()
		s.severities[sev.Name] = &sev
	}
}

// New returns an empty IncidentSeverity object.
func (s *Storage) New() runtime.Object {
	return &v1alpha1.IncidentSeverity{}
}

// Destroy cleans up resources on shutdown.
func (s *Storage) Destroy() {}

// NamespaceScoped returns false because IncidentSeverity is cluster-scoped.
func (s *Storage) NamespaceScoped() bool {
	return false
}

// GetSingularName returns the singular name of the resource.
func (s *Storage) GetSingularName() string {
	return "incidentseverity"
}

// NewList returns an empty IncidentSeverityList object.
func (s *Storage) NewList() runtime.Object {
	return &v1alpha1.IncidentSeverityList{}
}

// Get retrieves an IncidentSeverity by name.
func (s *Storage) Get(ctx context.Context, name string, options *metav1.GetOptions) (runtime.Object, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	sev, ok := s.severities[name]
	if !ok {
		return nil, errors.NewNotFound(v1alpha1.Resource("incidentseverities"), name)
	}

	return sev.DeepCopy(), nil
}

// List returns a list of all IncidentSeverities.
func (s *Storage) List(ctx context.Context, options *metainternalversion.ListOptions) (runtime.Object, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	list := &v1alpha1.IncidentSeverityList{
		TypeMeta: metav1.TypeMeta{
			APIVersion: v1alpha1.SchemeGroupVersion.String(),
			Kind:       "IncidentSeverityList",
		},
		Items: make([]v1alpha1.IncidentSeverity, 0, len(s.severities)),
	}

	for _, sev := range s.severities {
		list.Items = append(list.Items, *sev.DeepCopy())
	}

	return list, nil
}

// Create creates a new IncidentSeverity.
func (s *Storage) Create(ctx context.Context, obj runtime.Object, createValidation rest.ValidateObjectFunc, options *metav1.CreateOptions) (runtime.Object, error) {
	sev, ok := obj.(*v1alpha1.IncidentSeverity)
	if !ok {
		return nil, errors.NewBadRequest("not an IncidentSeverity object")
	}

	// Run strategy preparation
	s.strategy.PrepareForCreate(ctx, sev)

	// Validate
	if createValidation != nil {
		if err := createValidation(ctx, obj); err != nil {
			return nil, err
		}
	}

	errs := s.strategy.Validate(ctx, sev)
	if len(errs) > 0 {
		return nil, errors.NewInvalid(v1alpha1.SchemeGroupVersion.WithKind("IncidentSeverity").GroupKind(), sev.Name, errs)
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	// Check if already exists
	if _, exists := s.severities[sev.Name]; exists {
		return nil, errors.NewAlreadyExists(v1alpha1.Resource("incidentseverities"), sev.Name)
	}

	// Set metadata
	sev.TypeMeta = metav1.TypeMeta{
		APIVersion: v1alpha1.SchemeGroupVersion.String(),
		Kind:       "IncidentSeverity",
	}
	sev.CreationTimestamp = metav1.Now()
	sev.ResourceVersion = fmt.Sprintf("%d", metav1.Now().UnixNano())

	s.severities[sev.Name] = sev.DeepCopy()

	return sev.DeepCopy(), nil
}

// Update updates an existing IncidentSeverity.
func (s *Storage) Update(ctx context.Context, name string, objInfo rest.UpdatedObjectInfo, createValidation rest.ValidateObjectFunc, updateValidation rest.ValidateObjectUpdateFunc, forceAllowCreate bool, options *metav1.UpdateOptions) (runtime.Object, bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	oldSev, exists := s.severities[name]
	if !exists {
		return nil, false, errors.NewNotFound(v1alpha1.Resource("incidentseverities"), name)
	}

	newObj, err := objInfo.UpdatedObject(ctx, oldSev.DeepCopy())
	if err != nil {
		return nil, false, err
	}
	newSev := newObj.(*v1alpha1.IncidentSeverity)

	// Run strategy preparation
	s.strategy.PrepareForUpdate(ctx, newSev, oldSev)

	// Validate
	if updateValidation != nil {
		if err := updateValidation(ctx, newSev, oldSev); err != nil {
			return nil, false, err
		}
	}

	errs := s.strategy.ValidateUpdate(ctx, newSev, oldSev)
	if len(errs) > 0 {
		return nil, false, errors.NewInvalid(v1alpha1.SchemeGroupVersion.WithKind("IncidentSeverity").GroupKind(), name, errs)
	}

	// Update resource version
	newSev.ResourceVersion = fmt.Sprintf("%d", metav1.Now().UnixNano())

	s.severities[name] = newSev.DeepCopy()

	return newSev.DeepCopy(), false, nil
}

// Delete deletes an IncidentSeverity.
func (s *Storage) Delete(ctx context.Context, name string, deleteValidation rest.ValidateObjectFunc, options *metav1.DeleteOptions) (runtime.Object, bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	sev, exists := s.severities[name]
	if !exists {
		return nil, false, errors.NewNotFound(v1alpha1.Resource("incidentseverities"), name)
	}

	if deleteValidation != nil {
		if err := deleteValidation(ctx, sev); err != nil {
			return nil, false, err
		}
	}

	delete(s.severities, name)

	return sev.DeepCopy(), true, nil
}

// ConvertToTable converts the object to a table for display.
func (s *Storage) ConvertToTable(ctx context.Context, obj runtime.Object, tableOptions runtime.Object) (*metav1.Table, error) {
	return rest.NewDefaultTableConvertor(v1alpha1.Resource("incidentseverities")).ConvertToTable(ctx, obj, tableOptions)
}

// GetSeverityByName returns a severity by name. Used by other components for validation.
func (s *Storage) GetSeverityByName(name string) (*v1alpha1.IncidentSeverity, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	sev, ok := s.severities[name]
	if !ok {
		return nil, false
	}
	return sev.DeepCopy(), true
}
