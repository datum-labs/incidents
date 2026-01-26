package v1alpha1

import (
	"fmt"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

// GroupName is the group name for the incidents API
const GroupName = "incidents.operations.miloapis.com"

// SchemeGroupVersion is group version used to register these objects
var SchemeGroupVersion = schema.GroupVersion{Group: GroupName, Version: "v1alpha1"}

var (
	// SchemeBuilder is the scheme builder for this API group
	SchemeBuilder = runtime.NewSchemeBuilder(addKnownTypes, addFieldLabelConversions)
	// AddToScheme adds the types in this group-version to the given scheme
	AddToScheme = SchemeBuilder.AddToScheme
)

// Resource takes an unqualified resource and returns a Group qualified GroupResource
func Resource(resource string) schema.GroupResource {
	return SchemeGroupVersion.WithResource(resource).GroupResource()
}

// addKnownTypes adds the set of types defined in this package to the supplied scheme
func addKnownTypes(scheme *runtime.Scheme) error {
	scheme.AddKnownTypes(SchemeGroupVersion,
		&Incident{},
		&IncidentList{},
		&IncidentSeverity{},
		&IncidentSeverityList{},
		&IncidentEvent{},
		&IncidentEventList{},
		&IncidentTask{},
		&IncidentTaskList{},
	)
	metav1.AddToGroupVersion(scheme, SchemeGroupVersion)
	return nil
}

// addFieldLabelConversions adds field label conversion functions for custom field selectors
func addFieldLabelConversions(scheme *runtime.Scheme) error {
	// Allow spec.incidentName as a field selector for IncidentEvent
	if err := scheme.AddFieldLabelConversionFunc(SchemeGroupVersion.WithKind("IncidentEvent"),
		func(label, value string) (string, string, error) {
			switch label {
			case "metadata.name", "metadata.namespace", "spec.incidentName":
				return label, value, nil
			default:
				return "", "", fmt.Errorf("field label %q not supported for IncidentEvent", label)
			}
		}); err != nil {
		return err
	}

	// Allow spec.incidentName as a field selector for IncidentTask
	if err := scheme.AddFieldLabelConversionFunc(SchemeGroupVersion.WithKind("IncidentTask"),
		func(label, value string) (string, string, error) {
			switch label {
			case "metadata.name", "metadata.namespace", "spec.incidentName":
				return label, value, nil
			default:
				return "", "", fmt.Errorf("field label %q not supported for IncidentTask", label)
			}
		}); err != nil {
		return err
	}

	return nil
}
