package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +genclient:nonNamespaced
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// IncidentSeverity defines a severity level for incidents.
// This is a configuration resource that allows organizations to define
// their own severity levels (e.g., SEV1, SEV2, etc.)
type IncidentSeverity struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec IncidentSeveritySpec `json:"spec"`
}

// IncidentSeveritySpec defines the desired state of IncidentSeverity.
type IncidentSeveritySpec struct {
	// DisplayName is the human-readable name (e.g., "SEV1 - Critical")
	// +required
	DisplayName string `json:"displayName"`

	// Description explains when to use this severity level
	// +optional
	Description string `json:"description,omitempty"`

	// Color is the hex color code for UI display (e.g., "#FF0000")
	// +optional
	Color string `json:"color,omitempty"`

	// Order determines sort priority (lower = more severe)
	// +optional
	Order int32 `json:"order,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// IncidentSeverityList is a list of IncidentSeverity objects
type IncidentSeverityList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`

	Items []IncidentSeverity `json:"items"`
}

// +genclient
// +genclient:nonNamespaced
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// Incident represents an incident in the system, backed by Grafana IRM.
type Incident struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   IncidentSpec   `json:"spec"`
	Status IncidentStatus `json:"status,omitempty"`
}

// IncidentSpec defines the desired state of an Incident.
type IncidentSpec struct {
	// Title is the incident title
	// +required
	Title string `json:"title"`

	// SeverityRef references an IncidentSeverity by name
	// +optional
	SeverityRef string `json:"severityRef,omitempty"`

	// Labels are key-value pairs for categorization
	// +optional
	Labels []IncidentLabel `json:"labels,omitempty"`

	// IsDrill indicates if this is a practice/drill incident
	// +optional
	IsDrill bool `json:"isDrill,omitempty"`

	// Summary provides a description of the incident
	// +optional
	Summary string `json:"summary,omitempty"`

	// Roles are the role assignments for this incident
	// +optional
	Roles []RoleAssignment `json:"roles,omitempty"`
}

// IncidentLabel represents a key-value label for incident categorization.
type IncidentLabel struct {
	// Key is the label key
	Key string `json:"key"`

	// Value is the label value
	Value string `json:"value"`
}

// RoleAssignment represents a role assigned to a user in an incident.
type RoleAssignment struct {
	// Role is the role name (e.g., "commander", "investigator", "communicator")
	Role string `json:"role"`

	// UserID is the Grafana user ID
	UserID string `json:"userID"`
}

// IncidentStatus defines the observed state of an Incident.
type IncidentStatus struct {
	// Phase represents the current phase of the incident (active, resolved)
	// +optional
	Phase string `json:"phase,omitempty"`

	// IncidentID is the Grafana IRM incident ID
	// +optional
	IncidentID string `json:"incidentID,omitempty"`

	// Severity is the resolved severity name
	// +optional
	Severity string `json:"severity,omitempty"`

	// CreatedTime is when the incident was created
	// +optional
	CreatedTime *metav1.Time `json:"createdTime,omitempty"`

	// ModifiedTime is when the incident was last modified
	// +optional
	ModifiedTime *metav1.Time `json:"modifiedTime,omitempty"`

	// ClosedTime is when the incident was resolved/closed
	// +optional
	ClosedTime *metav1.Time `json:"closedTime,omitempty"`

	// Conditions represent the latest available observations of the incident's state
	// +optional
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// IncidentList is a list of Incident objects
type IncidentList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`

	Items []Incident `json:"items"`
}

// +genclient
// +genclient:nonNamespaced
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// IncidentEvent represents a timeline entry for an incident (note, status change, etc.).
// This is a subresource of Incident accessed via /incidents/{name}/events
type IncidentEvent struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec IncidentEventSpec `json:"spec"`
}

// IncidentEventSpec defines the content of an incident event.
type IncidentEventSpec struct {
	// IncidentName is the name of the parent incident
	// +required
	IncidentName string `json:"incidentName"`

	// Body is the event content (supports markdown)
	// +required
	Body string `json:"body"`

	// EventTime is when the event occurred
	// +optional
	EventTime *metav1.Time `json:"eventTime,omitempty"`

	// EventType is the type of event (note, status_change, etc.)
	// +optional
	EventType string `json:"eventType,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// IncidentEventList is a list of IncidentEvent objects
type IncidentEventList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`

	Items []IncidentEvent `json:"items"`
}

// +genclient
// +genclient:nonNamespaced
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// IncidentTask represents an action item within an incident.
// This is a subresource of Incident accessed via /incidents/{name}/tasks
type IncidentTask struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   IncidentTaskSpec   `json:"spec"`
	Status IncidentTaskStatus `json:"status,omitempty"`
}

// IncidentTaskSpec defines the desired state of an incident task.
type IncidentTaskSpec struct {
	// IncidentName is the name of the parent incident
	// +required
	IncidentName string `json:"incidentName"`

	// Text is the task description
	// +required
	Text string `json:"text"`

	// AssigneeUserID is the Grafana user ID of the assignee
	// +optional
	AssigneeUserID string `json:"assigneeUserID,omitempty"`
}

// IncidentTaskStatus defines the observed state of an incident task.
type IncidentTaskStatus struct {
	// TaskID is the Grafana IRM task ID
	// +optional
	TaskID string `json:"taskID,omitempty"`

	// Status is the task status (todo, progress, done)
	// +optional
	Status string `json:"status,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// IncidentTaskList is a list of IncidentTask objects
type IncidentTaskList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`

	Items []IncidentTask `json:"items"`
}
