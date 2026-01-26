package irm

import (
	"context"
	"fmt"
)

// ActivitiesService provides methods for managing incident activities (timeline entries).
type ActivitiesService struct {
	client *Client
}

// Add adds a new activity to an incident.
func (s *ActivitiesService) Add(ctx context.Context, req *AddActivityRequest) (*AddActivityResponse, error) {
	if req.IncidentID == "" {
		return nil, fmt.Errorf("incidentID is required")
	}
	if req.Body == "" {
		return nil, fmt.Errorf("body is required")
	}

	var resp AddActivityResponse
	if err := s.client.doRequest(ctx, "POST", "/ActivityService.AddActivity", req, &resp); err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	return &resp, nil
}

// Query queries activities for an incident.
func (s *ActivitiesService) Query(ctx context.Context, req *QueryActivityRequest) (*QueryActivityResponse, error) {
	if req.Query == nil || req.Query.IncidentID == "" {
		return nil, fmt.Errorf("query.incidentID is required")
	}

	var resp QueryActivityResponse
	if err := s.client.doRequest(ctx, "POST", "/ActivityService.QueryActivity", req, &resp); err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	return &resp, nil
}

// Update updates an existing activity.
func (s *ActivitiesService) Update(ctx context.Context, req *UpdateActivityRequest) (*UpdateActivityResponse, error) {
	if req.IncidentID == "" {
		return nil, fmt.Errorf("incidentID is required")
	}
	if req.ActivityItemID == "" {
		return nil, fmt.Errorf("activityItemID is required")
	}

	var resp UpdateActivityResponse
	if err := s.client.doRequest(ctx, "POST", "/ActivityService.UpdateActivity", req, &resp); err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	return &resp, nil
}
