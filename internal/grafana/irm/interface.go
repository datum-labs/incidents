package irm

import "context"

// Interface is the client interface for the Grafana IRM API.
// The concrete *Client satisfies this interface, as does *StubClient.
type Interface interface {
	Incidents() IncidentsIface
	Activities() ActivitiesIface
	Tasks() TasksIface
}

// IncidentsIface is the interface for the incidents sub-service.
type IncidentsIface interface {
	Create(ctx context.Context, req *CreateIncidentRequest) (*CreateIncidentResponse, error)
	Get(ctx context.Context, incidentID string) (*GetIncidentResponse, error)
	Update(ctx context.Context, req *UpdateIncidentRequest) (*UpdateIncidentResponse, error)
	Resolve(ctx context.Context, incidentID string) (*ResolveIncidentResponse, error)
	Query(ctx context.Context, req *QueryIncidentsRequest) (*QueryIncidentsResponse, error)
	AssignRole(ctx context.Context, req *AssignRoleRequest) (*AssignRoleResponse, error)
	UnassignRole(ctx context.Context, req *UnassignRoleRequest) (*UnassignRoleResponse, error)
}

// ActivitiesIface is the interface for the activities sub-service.
type ActivitiesIface interface {
	Add(ctx context.Context, req *AddActivityRequest) (*AddActivityResponse, error)
	Query(ctx context.Context, req *QueryActivityRequest) (*QueryActivityResponse, error)
	Update(ctx context.Context, req *UpdateActivityRequest) (*UpdateActivityResponse, error)
}

// TasksIface is the interface for the tasks sub-service.
type TasksIface interface {
	Add(ctx context.Context, req *AddTaskRequest) (*AddTaskResponse, error)
	Update(ctx context.Context, req *UpdateTaskRequest) (*UpdateTaskResponse, error)
	Delete(ctx context.Context, incidentID, taskID string) error
	Query(ctx context.Context, req *QueryTasksRequest) (*QueryTasksResponse, error)
}

// Compile-time checks that the concrete service types satisfy their interfaces.
var _ IncidentsIface = &IncidentsService{}
var _ ActivitiesIface = &ActivitiesService{}
var _ TasksIface = &TasksService{}
