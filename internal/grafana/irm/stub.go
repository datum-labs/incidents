package irm

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

// StubClient is an in-memory IRM client for use in demo/testing environments.
// Data is stored in-process and not persisted across restarts.
type StubClient struct {
	incidents  *stubIncidentsService
	activities *stubActivitiesService
	tasks      *stubTasksService
}

// NewStubClient creates a StubClient with shared in-memory storage.
func NewStubClient() *StubClient {
	return &StubClient{
		incidents:  &stubIncidentsService{},
		activities: &stubActivitiesService{},
		tasks:      &stubTasksService{},
	}
}

// Compile-time check that *StubClient satisfies Interface.
var _ Interface = &StubClient{}

func (s *StubClient) Incidents() IncidentsIface  { return s.incidents }
func (s *StubClient) Activities() ActivitiesIface { return s.activities }
func (s *StubClient) Tasks() TasksIface           { return s.tasks }

// stubIncidentsService is an in-memory implementation of IncidentsIface.
type stubIncidentsService struct {
	mu        sync.RWMutex
	incidents map[string]*Incident // keyed by IncidentID
	counter   atomic.Int64
}

func (s *stubIncidentsService) nextID() string {
	return fmt.Sprintf("stub-%d", s.counter.Add(1))
}

func (s *stubIncidentsService) store() map[string]*Incident {
	if s.incidents == nil {
		s.incidents = make(map[string]*Incident)
	}
	return s.incidents
}

func (s *stubIncidentsService) Create(_ context.Context, req *CreateIncidentRequest) (*CreateIncidentResponse, error) {
	now := FlexTime{Time: time.Now().UTC()}
	id := s.nextID()
	inc := &Incident{
		IncidentID:   id,
		Title:        req.Title,
		Severity:     req.Severity,
		Status:       "active",
		IsDrill:      req.IsDrill,
		Summary:      req.Summary,
		Labels:       req.Labels,
		CreatedTime:  now,
		ModifiedTime: now,
	}
	s.mu.Lock()
	s.store()[id] = inc
	s.mu.Unlock()
	return &CreateIncidentResponse{Incident: *inc, IncidentID: id}, nil
}

func (s *stubIncidentsService) Get(_ context.Context, incidentID string) (*GetIncidentResponse, error) {
	s.mu.RLock()
	inc, ok := s.store()[incidentID]
	s.mu.RUnlock()
	if !ok {
		return nil, fmt.Errorf("incident %q not found", incidentID)
	}
	cp := *inc
	return &GetIncidentResponse{Incident: cp}, nil
}

func (s *stubIncidentsService) Update(_ context.Context, req *UpdateIncidentRequest) (*UpdateIncidentResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	inc, ok := s.store()[req.IncidentID]
	if !ok {
		return nil, fmt.Errorf("incident %q not found", req.IncidentID)
	}
	if req.Title != "" {
		inc.Title = req.Title
	}
	if req.Severity != "" {
		inc.Severity = req.Severity
	}
	if req.Summary != "" {
		inc.Summary = req.Summary
	}
	if len(req.Labels) > 0 {
		inc.Labels = req.Labels
	}
	inc.ModifiedTime = FlexTime{Time: time.Now().UTC()}
	cp := *inc
	return &UpdateIncidentResponse{Incident: cp}, nil
}

func (s *stubIncidentsService) Resolve(_ context.Context, incidentID string) (*ResolveIncidentResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	inc, ok := s.store()[incidentID]
	if !ok {
		return nil, fmt.Errorf("incident %q not found", incidentID)
	}
	inc.Status = "resolved"
	now := FlexTime{Time: time.Now().UTC()}
	inc.ModifiedTime = now
	inc.ClosedTime = &now
	cp := *inc
	return &ResolveIncidentResponse{Incident: cp}, nil
}

func (s *stubIncidentsService) Query(_ context.Context, req *QueryIncidentsRequest) (*QueryIncidentsResponse, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []Incident
	for _, inc := range s.store() {
		if req != nil && req.Query != nil {
			q := req.Query
			if len(q.IncidentStatus) > 0 {
				match := false
				for _, st := range q.IncidentStatus {
					if inc.Status == st {
						match = true
						break
					}
				}
				if !match {
					continue
				}
			}
			if len(q.Severity) > 0 {
				match := false
				for _, sv := range q.Severity {
					if inc.Severity == sv {
						match = true
						break
					}
				}
				if !match {
					continue
				}
			}
		}
		result = append(result, *inc)
	}
	return &QueryIncidentsResponse{
		Incidents:    result,
		TotalResults: len(result),
	}, nil
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
