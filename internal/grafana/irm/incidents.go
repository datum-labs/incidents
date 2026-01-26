package irm

import (
	"context"
	"fmt"
)

// IncidentsService provides methods for managing incidents.
type IncidentsService struct {
	client *Client
}

// Create creates a new incident.
func (s *IncidentsService) Create(ctx context.Context, req *CreateIncidentRequest) (*CreateIncidentResponse, error) {
	var resp CreateIncidentResponse
	if err := s.client.doRequest(ctx, "POST", "/IncidentsService.CreateIncident", req, &resp); err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	return &resp, nil
}

// Get retrieves an incident by ID.
func (s *IncidentsService) Get(ctx context.Context, incidentID string) (*GetIncidentResponse, error) {
	req := &GetIncidentRequest{IncidentID: incidentID}
	var resp GetIncidentResponse
	if err := s.client.doRequest(ctx, "POST", "/IncidentsService.GetIncident", req, &resp); err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	return &resp, nil
}

// Update updates an existing incident.
func (s *IncidentsService) Update(ctx context.Context, req *UpdateIncidentRequest) (*UpdateIncidentResponse, error) {
	if req.IncidentID == "" {
		return nil, fmt.Errorf("incidentID is required")
	}
	var resp UpdateIncidentResponse
	if err := s.client.doRequest(ctx, "POST", "/IncidentsService.UpdateIncident", req, &resp); err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	return &resp, nil
}

// Resolve resolves an incident.
func (s *IncidentsService) Resolve(ctx context.Context, incidentID string) (*ResolveIncidentResponse, error) {
	req := &ResolveIncidentRequest{IncidentID: incidentID}
	var resp ResolveIncidentResponse
	if err := s.client.doRequest(ctx, "POST", "/IncidentsService.ResolveIncident", req, &resp); err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	return &resp, nil
}

// Query queries incidents with optional filters.
func (s *IncidentsService) Query(ctx context.Context, req *QueryIncidentsRequest) (*QueryIncidentsResponse, error) {
	var resp QueryIncidentsResponse
	if err := s.client.doRequest(ctx, "POST", "/IncidentsService.QueryIncidents", req, &resp); err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	return &resp, nil
}

// AssignRole assigns a role to a user for an incident.
func (s *IncidentsService) AssignRole(ctx context.Context, req *AssignRoleRequest) (*AssignRoleResponse, error) {
	var resp AssignRoleResponse
	if err := s.client.doRequest(ctx, "POST", "/IncidentsService.AssignRole", req, &resp); err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	return &resp, nil
}

// UnassignRole removes a role assignment from a user for an incident.
func (s *IncidentsService) UnassignRole(ctx context.Context, req *UnassignRoleRequest) (*UnassignRoleResponse, error) {
	var resp UnassignRoleResponse
	if err := s.client.doRequest(ctx, "POST", "/IncidentsService.UnassignRole", req, &resp); err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	return &resp, nil
}
