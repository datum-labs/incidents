package irm

import "context"

// StubClient is a no-op IRM client for use in demo/testing environments.
// All operations return zero-value responses and nil errors.
type StubClient struct{}

// Compile-time check that *StubClient satisfies Interface.
var _ Interface = &StubClient{}

func (s *StubClient) Incidents() IncidentsIface  { return &stubIncidentsService{} }
func (s *StubClient) Activities() ActivitiesIface { return &stubActivitiesService{} }
func (s *StubClient) Tasks() TasksIface           { return &stubTasksService{} }

// stubIncidentsService is a no-op implementation of IncidentsIface.
type stubIncidentsService struct{}

func (s *stubIncidentsService) Create(_ context.Context, _ *CreateIncidentRequest) (*CreateIncidentResponse, error) {
	return &CreateIncidentResponse{}, nil
}

func (s *stubIncidentsService) Get(_ context.Context, _ string) (*GetIncidentResponse, error) {
	return &GetIncidentResponse{}, nil
}

func (s *stubIncidentsService) Update(_ context.Context, _ *UpdateIncidentRequest) (*UpdateIncidentResponse, error) {
	return &UpdateIncidentResponse{}, nil
}

func (s *stubIncidentsService) Resolve(_ context.Context, _ string) (*ResolveIncidentResponse, error) {
	return &ResolveIncidentResponse{}, nil
}

func (s *stubIncidentsService) Query(_ context.Context, _ *QueryIncidentsRequest) (*QueryIncidentsResponse, error) {
	return &QueryIncidentsResponse{}, nil
}

func (s *stubIncidentsService) AssignRole(_ context.Context, _ *AssignRoleRequest) (*AssignRoleResponse, error) {
	return &AssignRoleResponse{}, nil
}

func (s *stubIncidentsService) UnassignRole(_ context.Context, _ *UnassignRoleRequest) (*UnassignRoleResponse, error) {
	return &UnassignRoleResponse{}, nil
}

// stubActivitiesService is a no-op implementation of ActivitiesIface.
type stubActivitiesService struct{}

func (s *stubActivitiesService) Add(_ context.Context, _ *AddActivityRequest) (*AddActivityResponse, error) {
	return &AddActivityResponse{}, nil
}

func (s *stubActivitiesService) Query(_ context.Context, _ *QueryActivityRequest) (*QueryActivityResponse, error) {
	return &QueryActivityResponse{}, nil
}

func (s *stubActivitiesService) Update(_ context.Context, _ *UpdateActivityRequest) (*UpdateActivityResponse, error) {
	return &UpdateActivityResponse{}, nil
}

// stubTasksService is a no-op implementation of TasksIface.
type stubTasksService struct{}

func (s *stubTasksService) Add(_ context.Context, _ *AddTaskRequest) (*AddTaskResponse, error) {
	return &AddTaskResponse{}, nil
}

func (s *stubTasksService) Update(_ context.Context, _ *UpdateTaskRequest) (*UpdateTaskResponse, error) {
	return &UpdateTaskResponse{}, nil
}

func (s *stubTasksService) Delete(_ context.Context, _, _ string) error {
	return nil
}

func (s *stubTasksService) Query(_ context.Context, _ *QueryTasksRequest) (*QueryTasksResponse, error) {
	return &QueryTasksResponse{}, nil
}
