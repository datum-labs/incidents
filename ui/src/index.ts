/**
 * @datum-cloud/incidents-ui
 *
 * React UI components for Kubernetes Incident Management.
 *
 * @example
 * ```tsx
 * import { IncidentsProvider, IncidentList, IncidentDetail } from '@datum-cloud/incidents-ui';
 * import '@datum-cloud/incidents-ui/styles.css';
 *
 * function App() {
 *   return (
 *     <IncidentsProvider config={{ baseUrl: '/api/k8s' }}>
 *       <IncidentList onIncidentClick={handleClick} />
 *     </IncidentsProvider>
 *   );
 * }
 * ```
 */

// Styles - import this in your app
import './styles/globals.css';

// Provider - must wrap your app
export { IncidentsProvider, useIncidentsContext, useApiClient } from './providers/IncidentsProvider';
export type { IncidentsProviderProps } from './providers/IncidentsProvider';

// API Client
export { IncidentsApiClient, createApiClient, getDefaultBaseUrl } from './api/client';

// React Query hooks
export {
  queryKeys,
  // Severities
  useSeverities,
  useSeverity,
  useCreateSeverity,
  useUpdateSeverity,
  useDeleteSeverity,
  // Incidents
  useIncidents,
  useIncident,
  useCreateIncident,
  useUpdateIncident,
  useDeleteIncident,
  // Events
  useEvents,
  useEventsByIncident,
  useEvent,
  useCreateEvent,
  useDeleteEvent,
  // Tasks
  useTasks,
  useTasksByIncident,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from './api/queries';

// Incident components
export {
  IncidentCard,
  IncidentDetail,
  IncidentForm,
  IncidentList,
  CreateIncidentDialog,
} from './components/incidents';
export type { IncidentCardProps } from './components/incidents/IncidentCard';
export type { IncidentDetailProps } from './components/incidents/IncidentDetail';
export type { IncidentFormProps, IncidentFormData } from './components/incidents/IncidentForm';
export type { IncidentListProps } from './components/incidents/IncidentList';
export type { CreateIncidentDialogProps } from './components/incidents/CreateIncidentDialog';

// Severity components
export {
  SeverityBadge,
  SeverityList,
  SeverityListCard,
  SeveritySelect,
} from './components/severity';
export type { SeverityBadgeProps } from './components/severity/SeverityBadge';
export type { SeverityListProps, SeverityListCardProps } from './components/severity/SeverityList';
export type { SeveritySelectProps } from './components/severity/SeveritySelect';

// Timeline components
export {
  Timeline,
  TimelineEntry,
  TimelineForm,
} from './components/timeline';
export type { TimelineProps } from './components/timeline/Timeline';
export type { TimelineEntryProps } from './components/timeline/TimelineEntry';
export type { TimelineFormProps } from './components/timeline/TimelineForm';

// Task components
export {
  TaskForm,
  TaskItem,
  TaskList,
} from './components/tasks';
export type { TaskFormProps } from './components/tasks/TaskForm';
export type { TaskItemProps } from './components/tasks/TaskItem';
export type { TaskListProps } from './components/tasks/TaskList';

// Base UI components
export * from './components/ui';

// Types
export type * from './types/api';

// Utilities
export { cn, toResourceName, formatTimestamp, formatRelativeTime, getInitials } from './lib/utils';
