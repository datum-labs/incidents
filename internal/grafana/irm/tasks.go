package irm

import (
	"context"
	"fmt"
)

// TasksService provides methods for managing incident tasks.
type TasksService struct {
	client *Client
}

// Add adds a new task to an incident.
func (s *TasksService) Add(ctx context.Context, req *AddTaskRequest) (*AddTaskResponse, error) {
	if req.IncidentID == "" {
		return nil, fmt.Errorf("incidentID is required")
	}
	if req.Text == "" {
		return nil, fmt.Errorf("text is required")
	}

	var resp AddTaskResponse
	if err := s.client.doRequest(ctx, "POST", "/TasksService.AddTask", req, &resp); err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	return &resp, nil
}

// Update updates an existing task.
func (s *TasksService) Update(ctx context.Context, req *UpdateTaskRequest) (*UpdateTaskResponse, error) {
	if req.IncidentID == "" {
		return nil, fmt.Errorf("incidentID is required")
	}
	if req.TaskID == "" {
		return nil, fmt.Errorf("taskID is required")
	}

	var resp UpdateTaskResponse
	if err := s.client.doRequest(ctx, "POST", "/TasksService.UpdateTask", req, &resp); err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	return &resp, nil
}

// Delete deletes a task from an incident.
func (s *TasksService) Delete(ctx context.Context, incidentID, taskID string) error {
	if incidentID == "" {
		return fmt.Errorf("incidentID is required")
	}
	if taskID == "" {
		return fmt.Errorf("taskID is required")
	}

	req := &DeleteTaskRequest{
		IncidentID: incidentID,
		TaskID:     taskID,
	}

	var resp DeleteTaskResponse
	if err := s.client.doRequest(ctx, "POST", "/TasksService.DeleteTask", req, &resp); err != nil {
		return err
	}
	if resp.Error != nil {
		return resp.Error
	}
	return nil
}

// Query queries tasks for an incident.
func (s *TasksService) Query(ctx context.Context, req *QueryTasksRequest) (*QueryTasksResponse, error) {
	if req.IncidentID == "" {
		return nil, fmt.Errorf("incidentID is required")
	}

	var resp QueryTasksResponse
	if err := s.client.doRequest(ctx, "POST", "/TasksService.QueryTasks", req, &resp); err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	return &resp, nil
}
