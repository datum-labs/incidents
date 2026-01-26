import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Incident,
  IncidentEvent,
  IncidentSeverity,
  IncidentTask,
  ListOptions,
} from '@/types/api';
import { useIncidentsContext } from '@/providers/IncidentsProvider';

// Query keys factory
export const queryKeys = {
  all: ['incidents'] as const,

  // Severities
  severities: () => [...queryKeys.all, 'severities'] as const,
  severitiesList: (options?: ListOptions) => [...queryKeys.severities(), 'list', options] as const,
  severity: (name: string) => [...queryKeys.severities(), 'detail', name] as const,

  // Incidents
  incidents: () => [...queryKeys.all, 'incidents'] as const,
  incidentsList: (options?: ListOptions) => [...queryKeys.incidents(), 'list', options] as const,
  incident: (name: string) => [...queryKeys.incidents(), 'detail', name] as const,

  // Events
  events: () => [...queryKeys.all, 'events'] as const,
  eventsList: (options?: ListOptions) => [...queryKeys.events(), 'list', options] as const,
  eventsByIncident: (incidentName: string, options?: ListOptions) =>
    [...queryKeys.events(), 'byIncident', incidentName, options] as const,
  event: (name: string) => [...queryKeys.events(), 'detail', name] as const,

  // Tasks
  tasks: () => [...queryKeys.all, 'tasks'] as const,
  tasksList: (options?: ListOptions) => [...queryKeys.tasks(), 'list', options] as const,
  tasksByIncident: (incidentName: string, options?: ListOptions) =>
    [...queryKeys.tasks(), 'byIncident', incidentName, options] as const,
  task: (name: string) => [...queryKeys.tasks(), 'detail', name] as const,
};

// ============================================================================
// Severity Queries & Mutations
// ============================================================================

export function useSeverities(options?: ListOptions) {
  const { apiClient } = useIncidentsContext();
  return useQuery({
    queryKey: queryKeys.severitiesList(options),
    queryFn: () => apiClient.listSeverities(options),
  });
}

export function useSeverity(name: string) {
  const { apiClient } = useIncidentsContext();
  return useQuery({
    queryKey: queryKeys.severity(name),
    queryFn: () => apiClient.getSeverity(name),
    enabled: !!name,
  });
}

export function useCreateSeverity() {
  const { apiClient } = useIncidentsContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (severity: Omit<IncidentSeverity, 'kind' | 'apiVersion'>) =>
      apiClient.createSeverity(severity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.severities() });
    },
  });
}

export function useUpdateSeverity() {
  const { apiClient } = useIncidentsContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, severity }: { name: string; severity: Omit<IncidentSeverity, 'kind' | 'apiVersion'> }) =>
      apiClient.updateSeverity(name, severity),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.severities() });
      queryClient.setQueryData(queryKeys.severity(data.metadata.name), data);
    },
  });
}

export function useDeleteSeverity() {
  const { apiClient } = useIncidentsContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => apiClient.deleteSeverity(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.severities() });
    },
  });
}

// ============================================================================
// Incident Queries & Mutations
// ============================================================================

export function useIncidents(options?: ListOptions) {
  const { apiClient } = useIncidentsContext();
  return useQuery({
    queryKey: queryKeys.incidentsList(options),
    queryFn: () => apiClient.listIncidents(options),
  });
}

export function useIncident(name: string) {
  const { apiClient } = useIncidentsContext();
  return useQuery({
    queryKey: queryKeys.incident(name),
    queryFn: () => apiClient.getIncident(name),
    enabled: !!name,
  });
}

export function useCreateIncident() {
  const { apiClient } = useIncidentsContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (incident: Omit<Incident, 'kind' | 'apiVersion' | 'status'>) =>
      apiClient.createIncident(incident),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents() });
    },
  });
}

export function useUpdateIncident() {
  const { apiClient } = useIncidentsContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, incident }: { name: string; incident: Omit<Incident, 'kind' | 'apiVersion'> }) =>
      apiClient.updateIncident(name, incident),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents() });
      queryClient.setQueryData(queryKeys.incident(data.metadata.name), data);
    },
  });
}

export function useDeleteIncident() {
  const { apiClient } = useIncidentsContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => apiClient.deleteIncident(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents() });
    },
  });
}

// ============================================================================
// Event Queries & Mutations
// ============================================================================

export function useEvents(options?: ListOptions) {
  const { apiClient } = useIncidentsContext();
  return useQuery({
    queryKey: queryKeys.eventsList(options),
    queryFn: () => apiClient.listEvents(options),
  });
}

export function useEventsByIncident(incidentName: string, options?: ListOptions) {
  const { apiClient } = useIncidentsContext();
  return useQuery({
    queryKey: queryKeys.eventsByIncident(incidentName, options),
    queryFn: () => apiClient.listEventsByIncident(incidentName, options),
    enabled: !!incidentName,
  });
}

export function useEvent(name: string) {
  const { apiClient } = useIncidentsContext();
  return useQuery({
    queryKey: queryKeys.event(name),
    queryFn: () => apiClient.getEvent(name),
    enabled: !!name,
  });
}

export function useCreateEvent() {
  const { apiClient } = useIncidentsContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (event: Omit<IncidentEvent, 'kind' | 'apiVersion'>) =>
      apiClient.createEvent(event),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events() });
      if (data.spec.incidentName) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.eventsByIncident(data.spec.incidentName),
        });
      }
    },
  });
}

export function useDeleteEvent() {
  const { apiClient } = useIncidentsContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => apiClient.deleteEvent(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events() });
    },
  });
}

// ============================================================================
// Task Queries & Mutations
// ============================================================================

export function useTasks(options?: ListOptions) {
  const { apiClient } = useIncidentsContext();
  return useQuery({
    queryKey: queryKeys.tasksList(options),
    queryFn: () => apiClient.listTasks(options),
  });
}

export function useTasksByIncident(incidentName: string, options?: ListOptions) {
  const { apiClient } = useIncidentsContext();
  return useQuery({
    queryKey: queryKeys.tasksByIncident(incidentName, options),
    queryFn: () => apiClient.listTasksByIncident(incidentName, options),
    enabled: !!incidentName,
  });
}

export function useTask(name: string) {
  const { apiClient } = useIncidentsContext();
  return useQuery({
    queryKey: queryKeys.task(name),
    queryFn: () => apiClient.getTask(name),
    enabled: !!name,
  });
}

export function useCreateTask() {
  const { apiClient } = useIncidentsContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Omit<IncidentTask, 'kind' | 'apiVersion' | 'status'>) =>
      apiClient.createTask(task),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
      if (data.spec.incidentName) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasksByIncident(data.spec.incidentName),
        });
      }
    },
  });
}

export function useUpdateTask() {
  const { apiClient } = useIncidentsContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, task }: { name: string; task: Omit<IncidentTask, 'kind' | 'apiVersion'> }) =>
      apiClient.updateTask(name, task),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
      queryClient.setQueryData(queryKeys.task(data.metadata.name), data);
      if (data.spec.incidentName) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasksByIncident(data.spec.incidentName),
        });
      }
    },
  });
}

export function useDeleteTask() {
  const { apiClient } = useIncidentsContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => apiClient.deleteTask(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
    },
  });
}
