// Package irm provides a client for the Grafana IRM (Incident Response Management) API.
package irm

import (
	"encoding/json"
	"time"
)

// FlexTime handles time fields that may be empty strings in JSON.
type FlexTime struct {
	time.Time
}

// UnmarshalJSON implements custom unmarshaling that handles empty strings.
func (ft *FlexTime) UnmarshalJSON(data []byte) error {
	// Handle empty string or null
	if string(data) == `""` || string(data) == "null" {
		ft.Time = time.Time{}
		return nil
	}
	return json.Unmarshal(data, &ft.Time)
}

// Incident represents an incident in Grafana IRM.
type Incident struct {
	IncidentID         string          `json:"incidentID"`
	Title              string          `json:"title"`
	Severity           string          `json:"severity,omitempty"`
	Status             string          `json:"status"` // active, resolved
	IsDrill            bool            `json:"isDrill,omitempty"`
	Summary            string          `json:"summary,omitempty"`
	Labels             []Label         `json:"labels,omitempty"`
	CreatedTime        FlexTime        `json:"createdTime"`
	ModifiedTime       FlexTime        `json:"modifiedTime"`
	ClosedTime         *FlexTime       `json:"closedTime,omitempty"`
	IncidentMembership json.RawMessage `json:"incidentMembership,omitempty"` // Ignore complex nested structure
}

// Label represents a key-value label in Grafana IRM.
type Label struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// Activity represents a timeline entry (ActivityItem) in Grafana IRM.
type Activity struct {
	ActivityItemID string     `json:"activityItemID"`
	IncidentID     string     `json:"incidentID"`
	Body           string     `json:"body"`
	ActivityKind   string     `json:"activityKind,omitempty"` // userNote, incidentCreated, etc.
	CreatedTime    time.Time  `json:"createdTime"`
	EventTime      *time.Time `json:"eventTime,omitempty"`
	User           *User      `json:"user,omitempty"`
}

// User represents a user in Grafana IRM.
type User struct {
	UserID string `json:"userID"`
	Name   string `json:"name,omitempty"`
	Email  string `json:"email,omitempty"`
}

// Task represents an action item in Grafana IRM.
type Task struct {
	TaskID         string `json:"taskID"`
	IncidentID     string `json:"incidentID"`
	Text           string `json:"text"`
	Status         string `json:"status"` // todo, progress, done
	AssigneeUserID string `json:"assigneeUserID,omitempty"`
}

// CreateIncidentRequest is the request body for creating an incident.
type CreateIncidentRequest struct {
	Title    string  `json:"title"`
	Severity string  `json:"severity,omitempty"`
	IsDrill  bool    `json:"isDrill,omitempty"`
	Summary  string  `json:"summary,omitempty"`
	Labels   []Label `json:"labels,omitempty"`
}

// CreateIncidentResponse is the response from creating an incident.
type CreateIncidentResponse struct {
	Incident  Incident `json:"incident"`
	IncidentID string   `json:"incidentID"`
	Error     *APIError `json:"error,omitempty"`
}

// GetIncidentRequest is the request for getting an incident.
type GetIncidentRequest struct {
	IncidentID string `json:"incidentID"`
}

// GetIncidentResponse is the response from getting an incident.
type GetIncidentResponse struct {
	Incident Incident  `json:"incident"`
	Error    *APIError `json:"error,omitempty"`
}

// UpdateIncidentRequest is the request body for updating an incident.
type UpdateIncidentRequest struct {
	IncidentID string  `json:"incidentID"`
	Title      string  `json:"title,omitempty"`
	Severity   string  `json:"severity,omitempty"`
	Summary    string  `json:"summary,omitempty"`
	Labels     []Label `json:"labels,omitempty"`
}

// UpdateIncidentResponse is the response from updating an incident.
type UpdateIncidentResponse struct {
	Incident Incident  `json:"incident"`
	Error    *APIError `json:"error,omitempty"`
}

// ResolveIncidentRequest is the request body for resolving an incident.
type ResolveIncidentRequest struct {
	IncidentID string `json:"incidentID"`
}

// ResolveIncidentResponse is the response from resolving an incident.
type ResolveIncidentResponse struct {
	Incident Incident  `json:"incident"`
	Error    *APIError `json:"error,omitempty"`
}

// QueryIncidentsRequest is the request for querying incidents.
type QueryIncidentsRequest struct {
	// Query contains the query parameters
	Query *IncidentQuery `json:"query"`
}

// IncidentQuery represents query parameters for filtering incidents.
type IncidentQuery struct {
	// Limit is the maximum number of incidents to return
	Limit int `json:"limit,omitempty"`
	// Cursor is the pagination cursor
	Cursor string `json:"cursor,omitempty"`
	// OrderDirection specifies the sort order (ASC or DESC)
	OrderDirection string `json:"orderDirection,omitempty"`
	// IncidentStatus filters by status (active, resolved)
	IncidentStatus []string `json:"incidentStatus,omitempty"`
	// Severity filters by severity level
	Severity []string `json:"severity,omitempty"`
	// IsDrill filters by drill status
	IsDrill *bool `json:"isDrill,omitempty"`
}

// QueryIncidentsResponse is the response from querying incidents.
type QueryIncidentsResponse struct {
	Incidents    []Incident `json:"incidents"`
	NextCursor   string     `json:"nextCursor,omitempty"`
	TotalResults int        `json:"totalResults,omitempty"`
	Error        *APIError  `json:"error,omitempty"`
}

// AddActivityRequest is the request body for adding an activity.
type AddActivityRequest struct {
	IncidentID   string     `json:"incidentID"`
	Body         string     `json:"body"`
	ActivityKind string     `json:"activityKind,omitempty"` // userNote is the typical value
	EventTime    *time.Time `json:"eventTime,omitempty"`
}

// AddActivityResponse is the response from adding an activity.
type AddActivityResponse struct {
	ActivityItem   Activity  `json:"activityItem"`
	ActivityItemID string    `json:"activityItemID"`
	Error          *APIError `json:"error,omitempty"`
}

// Cursor represents a pagination cursor.
type Cursor struct {
	HasMore   bool   `json:"hasMore,omitempty"`
	NextValue string `json:"nextValue,omitempty"`
}

// QueryActivityRequest is the request for querying activities.
type QueryActivityRequest struct {
	Query  *ActivityQuery `json:"query"`
	Cursor *Cursor        `json:"cursor,omitempty"`
}

// ActivityQuery represents query parameters for filtering activities.
type ActivityQuery struct {
	IncidentID     string `json:"incidentID,omitempty"`
	Limit          int    `json:"limit,omitempty"`
	OrderDirection string `json:"orderDirection,omitempty"`
	ActivityKind   string `json:"activityKind,omitempty"`
}

// QueryActivityResponse is the response from querying activities.
type QueryActivityResponse struct {
	ActivityItems []Activity `json:"activityItems"`
	Cursor        *Cursor    `json:"cursor,omitempty"`
	Error         *APIError  `json:"error,omitempty"`
}

// UpdateActivityRequest is the request body for updating an activity.
type UpdateActivityRequest struct {
	IncidentID     string `json:"incidentID"`
	ActivityItemID string `json:"activityItemID"`
	Body           string `json:"body,omitempty"`
}

// UpdateActivityResponse is the response from updating an activity.
type UpdateActivityResponse struct {
	Activity Activity  `json:"activity"`
	Error    *APIError `json:"error,omitempty"`
}

// AddTaskRequest is the request body for adding a task.
type AddTaskRequest struct {
	IncidentID     string `json:"incidentID"`
	Text           string `json:"text"`
	AssigneeUserID string `json:"assigneeUserID,omitempty"`
}

// AddTaskResponse is the response from adding a task.
type AddTaskResponse struct {
	Task   Task      `json:"task"`
	TaskID string    `json:"taskID"`
	Error  *APIError `json:"error,omitempty"`
}

// UpdateTaskRequest is the request body for updating a task.
type UpdateTaskRequest struct {
	IncidentID     string `json:"incidentID"`
	TaskID         string `json:"taskID"`
	Text           string `json:"text,omitempty"`
	Status         string `json:"status,omitempty"` // todo, progress, done
	AssigneeUserID string `json:"assigneeUserID,omitempty"`
}

// UpdateTaskResponse is the response from updating a task.
type UpdateTaskResponse struct {
	Task  Task      `json:"task"`
	Error *APIError `json:"error,omitempty"`
}

// DeleteTaskRequest is the request for deleting a task.
type DeleteTaskRequest struct {
	IncidentID string `json:"incidentID"`
	TaskID     string `json:"taskID"`
}

// DeleteTaskResponse is the response from deleting a task.
type DeleteTaskResponse struct {
	Error *APIError `json:"error,omitempty"`
}

// QueryTasksRequest is the request for querying tasks.
type QueryTasksRequest struct {
	IncidentID string `json:"incidentID"`
	Limit      int    `json:"limit,omitempty"`
	Cursor     string `json:"cursor,omitempty"`
}

// QueryTasksResponse is the response from querying tasks.
type QueryTasksResponse struct {
	Tasks      []Task    `json:"tasks"`
	NextCursor string    `json:"nextCursor,omitempty"`
	Error      *APIError `json:"error,omitempty"`
}

// AssignRoleRequest is the request body for assigning a role.
type AssignRoleRequest struct {
	IncidentID string `json:"incidentID"`
	Role       string `json:"role"`
	UserID     string `json:"userID"`
}

// AssignRoleResponse is the response from assigning a role.
type AssignRoleResponse struct {
	Incident Incident  `json:"incident"`
	Error    *APIError `json:"error,omitempty"`
}

// UnassignRoleRequest is the request body for unassigning a role.
type UnassignRoleRequest struct {
	IncidentID string `json:"incidentID"`
	Role       string `json:"role"`
	UserID     string `json:"userID"`
}

// UnassignRoleResponse is the response from unassigning a role.
type UnassignRoleResponse struct {
	Incident Incident  `json:"incident"`
	Error    *APIError `json:"error,omitempty"`
}

// APIError represents an error from the Grafana IRM API.
type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (e *APIError) Error() string {
	if e == nil {
		return ""
	}
	return e.Message
}
