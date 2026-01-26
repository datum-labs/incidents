package incident

import (
	"strings"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"go.miloapis.com/incidents/internal/grafana/irm"
	"go.miloapis.com/incidents/pkg/apis/incidents/v1alpha1"
)

// ToGrafanaCreateRequest converts a Kubernetes Incident to a Grafana IRM CreateIncidentRequest.
func ToGrafanaCreateRequest(incident *v1alpha1.Incident) *irm.CreateIncidentRequest {
	req := &irm.CreateIncidentRequest{
		Title:    incident.Spec.Title,
		Severity: incident.Spec.SeverityRef,
		IsDrill:  incident.Spec.IsDrill,
		Summary:  incident.Spec.Summary,
	}

	// Convert labels
	if len(incident.Spec.Labels) > 0 {
		req.Labels = make([]irm.Label, len(incident.Spec.Labels))
		for i, l := range incident.Spec.Labels {
			req.Labels[i] = irm.Label{
				Key:   l.Key,
				Value: l.Value,
			}
		}
	}

	return req
}

// ToGrafanaUpdateRequest converts a Kubernetes Incident to a Grafana IRM UpdateIncidentRequest.
func ToGrafanaUpdateRequest(incident *v1alpha1.Incident, incidentID string) *irm.UpdateIncidentRequest {
	req := &irm.UpdateIncidentRequest{
		IncidentID: incidentID,
		Title:      incident.Spec.Title,
		Severity:   incident.Spec.SeverityRef,
		Summary:    incident.Spec.Summary,
	}

	// Convert labels
	if len(incident.Spec.Labels) > 0 {
		req.Labels = make([]irm.Label, len(incident.Spec.Labels))
		for i, l := range incident.Spec.Labels {
			req.Labels[i] = irm.Label{
				Key:   l.Key,
				Value: l.Value,
			}
		}
	}

	return req
}

// FromGrafanaIncident converts a Grafana IRM Incident to a Kubernetes Incident.
func FromGrafanaIncident(grafanaIncident *irm.Incident) *v1alpha1.Incident {
	incident := &v1alpha1.Incident{
		TypeMeta: metav1.TypeMeta{
			APIVersion: v1alpha1.SchemeGroupVersion.String(),
			Kind:       "Incident",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name: toKubernetesName(grafanaIncident.Title),
			Annotations: map[string]string{
				AnnotationIncidentID: grafanaIncident.IncidentID,
			},
			CreationTimestamp: metav1.NewTime(grafanaIncident.CreatedTime.Time),
		},
		Spec: v1alpha1.IncidentSpec{
			Title:       grafanaIncident.Title,
			SeverityRef: grafanaIncident.Severity,
			IsDrill:     grafanaIncident.IsDrill,
			Summary:     grafanaIncident.Summary,
		},
		Status: v1alpha1.IncidentStatus{
			Phase:        grafanaIncident.Status,
			IncidentID:   grafanaIncident.IncidentID,
			Severity:     grafanaIncident.Severity,
			CreatedTime:  ptrTime(metav1.NewTime(grafanaIncident.CreatedTime.Time)),
			ModifiedTime: ptrTime(metav1.NewTime(grafanaIncident.ModifiedTime.Time)),
		},
	}

	// Convert labels
	if len(grafanaIncident.Labels) > 0 {
		incident.Spec.Labels = make([]v1alpha1.IncidentLabel, len(grafanaIncident.Labels))
		for i, l := range grafanaIncident.Labels {
			incident.Spec.Labels[i] = v1alpha1.IncidentLabel{
				Key:   l.Key,
				Value: l.Value,
			}
		}
	}

	// Set closed time if available
	if grafanaIncident.ClosedTime != nil && !grafanaIncident.ClosedTime.Time.IsZero() {
		incident.Status.ClosedTime = ptrTime(metav1.NewTime(grafanaIncident.ClosedTime.Time))
	}

	return incident
}

// AnnotationIncidentID is the annotation key for storing the Grafana IRM incident ID.
const AnnotationIncidentID = "incidents.operations.miloapis.com/incident-id"

// toKubernetesName converts a title to a valid Kubernetes resource name.
func toKubernetesName(title string) string {
	// Convert to lowercase
	name := strings.ToLower(title)

	// Replace spaces and underscores with hyphens
	name = strings.ReplaceAll(name, " ", "-")
	name = strings.ReplaceAll(name, "_", "-")

	// Remove any characters that aren't alphanumeric or hyphens
	var result strings.Builder
	for _, r := range name {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			result.WriteRune(r)
		}
	}
	name = result.String()

	// Remove leading/trailing hyphens
	name = strings.Trim(name, "-")

	// Collapse multiple hyphens
	for strings.Contains(name, "--") {
		name = strings.ReplaceAll(name, "--", "-")
	}

	// Truncate to max length (253 chars for Kubernetes names)
	if len(name) > 253 {
		name = name[:253]
	}

	// Ensure name is not empty
	if name == "" {
		name = "incident"
	}

	return name
}

// ptrTime returns a pointer to the given Time.
func ptrTime(t metav1.Time) *metav1.Time {
	return &t
}
