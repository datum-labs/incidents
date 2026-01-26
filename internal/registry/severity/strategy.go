package severity

import (
	"context"

	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/util/validation/field"
	"k8s.io/apiserver/pkg/storage/names"

	"go.miloapis.com/incidents/pkg/apis/incidents/v1alpha1"
)

// Strategy implements behavior for IncidentSeverity objects.
type Strategy struct {
	runtime.ObjectTyper
	names.NameGenerator
}

// NewStrategy creates a new Strategy.
func NewStrategy(typer runtime.ObjectTyper) Strategy {
	return Strategy{typer, names.SimpleNameGenerator}
}

// NamespaceScoped returns false because IncidentSeverities are cluster-scoped.
func (Strategy) NamespaceScoped() bool {
	return false
}

// PrepareForCreate clears fields that are not allowed to be set on creation.
func (Strategy) PrepareForCreate(ctx context.Context, obj runtime.Object) {
	// Nothing special to do
}

// PrepareForUpdate clears fields that are not allowed to be set on update.
func (Strategy) PrepareForUpdate(ctx context.Context, obj, old runtime.Object) {
	// Nothing special to do
}

// Validate validates a new IncidentSeverity.
func (Strategy) Validate(ctx context.Context, obj runtime.Object) field.ErrorList {
	severity := obj.(*v1alpha1.IncidentSeverity)
	return validateSeverity(severity)
}

// WarningsOnCreate returns warnings for the creation of the given object.
func (Strategy) WarningsOnCreate(ctx context.Context, obj runtime.Object) []string {
	return nil
}

// AllowCreateOnUpdate returns false because IncidentSeverities cannot be created via PUT.
func (Strategy) AllowCreateOnUpdate() bool {
	return false
}

// ValidateUpdate validates an update to an IncidentSeverity.
func (Strategy) ValidateUpdate(ctx context.Context, obj, old runtime.Object) field.ErrorList {
	newSeverity := obj.(*v1alpha1.IncidentSeverity)
	return validateSeverity(newSeverity)
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

// validateSeverity validates an IncidentSeverity object.
func validateSeverity(severity *v1alpha1.IncidentSeverity) field.ErrorList {
	allErrs := field.ErrorList{}

	// Validate displayName
	if severity.Spec.DisplayName == "" {
		allErrs = append(allErrs, field.Required(
			field.NewPath("spec", "displayName"),
			"displayName is required",
		))
	}

	// Validate order (must be positive)
	if severity.Spec.Order < 0 {
		allErrs = append(allErrs, field.Invalid(
			field.NewPath("spec", "order"),
			severity.Spec.Order,
			"order must be non-negative",
		))
	}

	// Validate color format if provided
	if severity.Spec.Color != "" {
		if len(severity.Spec.Color) > 0 && severity.Spec.Color[0] != '#' {
			allErrs = append(allErrs, field.Invalid(
				field.NewPath("spec", "color"),
				severity.Spec.Color,
				"color must be a hex color code starting with #",
			))
		}
	}

	return allErrs
}
