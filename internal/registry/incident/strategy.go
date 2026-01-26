package incident

import (
	"context"
	"fmt"

	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/labels"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/util/validation/field"
	"k8s.io/apiserver/pkg/storage"
	"k8s.io/apiserver/pkg/storage/names"

	"go.miloapis.com/incidents/pkg/apis/incidents/v1alpha1"
)

// Strategy implements behavior for Incident objects.
type Strategy struct {
	runtime.ObjectTyper
	names.NameGenerator
}

// NewStrategy creates a new Strategy.
func NewStrategy(typer runtime.ObjectTyper) Strategy {
	return Strategy{typer, names.SimpleNameGenerator}
}

// NamespaceScoped returns false because Incidents are cluster-scoped.
func (Strategy) NamespaceScoped() bool {
	return false
}

// PrepareForCreate clears fields that are not allowed to be set on creation.
func (Strategy) PrepareForCreate(ctx context.Context, obj runtime.Object) {
	incident := obj.(*v1alpha1.Incident)
	// Clear status on create - it will be populated by the storage backend
	incident.Status = v1alpha1.IncidentStatus{}
}

// PrepareForUpdate clears fields that are not allowed to be set on update.
func (Strategy) PrepareForUpdate(ctx context.Context, obj, old runtime.Object) {
	newIncident := obj.(*v1alpha1.Incident)
	oldIncident := old.(*v1alpha1.Incident)

	// Preserve status from old object - status should only be updated by the system
	newIncident.Status = oldIncident.Status
}

// Validate validates a new Incident.
func (Strategy) Validate(ctx context.Context, obj runtime.Object) field.ErrorList {
	incident := obj.(*v1alpha1.Incident)
	return validateIncident(incident)
}

// WarningsOnCreate returns warnings for the creation of the given object.
func (Strategy) WarningsOnCreate(ctx context.Context, obj runtime.Object) []string {
	return nil
}

// AllowCreateOnUpdate returns false because Incidents cannot be created via PUT.
func (Strategy) AllowCreateOnUpdate() bool {
	return false
}

// ValidateUpdate validates an update to an Incident.
func (Strategy) ValidateUpdate(ctx context.Context, obj, old runtime.Object) field.ErrorList {
	newIncident := obj.(*v1alpha1.Incident)
	oldIncident := old.(*v1alpha1.Incident)

	allErrs := validateIncident(newIncident)

	// Validate that incident ID annotation hasn't changed
	oldID := oldIncident.Annotations[AnnotationIncidentID]
	newID := newIncident.Annotations[AnnotationIncidentID]
	if oldID != "" && newID != oldID {
		allErrs = append(allErrs, field.Invalid(
			field.NewPath("metadata", "annotations", AnnotationIncidentID),
			newID,
			"incident ID cannot be changed",
		))
	}

	return allErrs
}

// WarningsOnUpdate returns warnings for the update of the given object.
func (Strategy) WarningsOnUpdate(ctx context.Context, obj, old runtime.Object) []string {
	return nil
}

// AllowUnconditionalUpdate returns false so that updates require the resource version to be specified.
func (Strategy) AllowUnconditionalUpdate() bool {
	return false
}

// Canonicalize normalizes the object after validation.
func (Strategy) Canonicalize(obj runtime.Object) {
	// Nothing to do
}

// validateIncident validates an Incident object.
func validateIncident(incident *v1alpha1.Incident) field.ErrorList {
	allErrs := field.ErrorList{}

	// Validate title
	if incident.Spec.Title == "" {
		allErrs = append(allErrs, field.Required(
			field.NewPath("spec", "title"),
			"title is required",
		))
	}

	// Validate labels
	for i, label := range incident.Spec.Labels {
		if label.Key == "" {
			allErrs = append(allErrs, field.Required(
				field.NewPath("spec", "labels").Index(i).Child("key"),
				"label key is required",
			))
		}
	}

	// Validate roles
	validRoles := map[string]bool{
		"commander":    true,
		"investigator": true,
		"communicator": true,
		"observer":     true,
		"lead":         true,
		"responder":    true,
	}
	for i, role := range incident.Spec.Roles {
		if role.Role == "" {
			allErrs = append(allErrs, field.Required(
				field.NewPath("spec", "roles").Index(i).Child("role"),
				"role is required",
			))
		} else if !validRoles[role.Role] {
			allErrs = append(allErrs, field.NotSupported(
				field.NewPath("spec", "roles").Index(i).Child("role"),
				role.Role,
				[]string{"commander", "investigator", "communicator", "observer", "lead", "responder"},
			))
		}
		if role.UserID == "" {
			allErrs = append(allErrs, field.Required(
				field.NewPath("spec", "roles").Index(i).Child("userID"),
				"userID is required",
			))
		}
	}

	return allErrs
}

// GetAttrs returns labels and fields of an Incident for filtering.
func GetAttrs(obj runtime.Object) (labels.Set, fields.Set, error) {
	incident, ok := obj.(*v1alpha1.Incident)
	if !ok {
		return nil, nil, fmt.Errorf("not an Incident object")
	}
	return incident.Labels, SelectableFields(incident), nil
}

// SelectableFields returns the set of fields that can be used for field selectors.
func SelectableFields(incident *v1alpha1.Incident) fields.Set {
	return fields.Set{
		"metadata.name":   incident.Name,
		"spec.title":      incident.Spec.Title,
		"status.phase":    incident.Status.Phase,
		"status.severity": incident.Status.Severity,
	}
}

// MatchIncident returns a generic matcher for a given label and field selector.
func MatchIncident(label labels.Selector, field fields.Selector) storage.SelectionPredicate {
	return storage.SelectionPredicate{
		Label:    label,
		Field:    field,
		GetAttrs: GetAttrs,
	}
}
