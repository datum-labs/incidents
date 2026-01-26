/**
 * TypeScript types matching the Kubernetes API types from pkg/apis/incidents/v1alpha1/types.go
 * These types follow Kubernetes resource conventions.
 */

/**
 * ObjectMeta contains metadata that all persisted resources must have.
 * Simplified version of k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta
 */
export interface ObjectMeta {
  /** Name must be unique within a namespace. */
  name: string;
  /** Namespace defines the space within which each name must be unique. */
  namespace?: string;
  /** UID is the unique identifier in time and space for this object. */
  uid?: string;
  /** A URL representing this object. */
  selfLink?: string;
  /** String that identifies the server's internal version of this object. */
  resourceVersion?: string;
  /** CreationTimestamp is a timestamp representing the server time when this object was created. */
  creationTimestamp?: string;
  /** Map of string keys and values that can be used to organize and categorize objects. */
  labels?: Record<string, string>;
  /** Annotations is an unstructured key value map stored with a resource. */
  annotations?: Record<string, string>;
}

/**
 * TypeMeta describes an individual object in an API response or request.
 */
export interface TypeMeta {
  /** Kind is a string value representing the REST resource this object represents. */
  kind?: string;
  /** APIVersion defines the versioned schema of this representation of an object. */
  apiVersion?: string;
}

/**
 * ListMeta describes metadata that synthetic resources must have.
 */
export interface ListMeta {
  /** selfLink is a URL representing this object. */
  selfLink?: string;
  /** String that identifies the server's internal version of this object. */
  resourceVersion?: string;
  /** continue may be set if the user set a limit on the number of items returned. */
  continue?: string;
  /** remainingItemCount is the number of subsequent items in the list. */
  remainingItemCount?: number;
}

/**
 * Condition contains details for one aspect of the current state of this API Resource.
 */
export interface Condition {
  /** type of condition in CamelCase. */
  type: string;
  /** status of the condition, one of True, False, Unknown. */
  status: 'True' | 'False' | 'Unknown';
  /** observedGeneration represents the .metadata.generation that the condition was set based upon. */
  observedGeneration?: number;
  /** lastTransitionTime is the last time the condition transitioned from one status to another. */
  lastTransitionTime?: string;
  /** reason contains a programmatic identifier indicating the reason for the condition's last transition. */
  reason: string;
  /** message is a human readable message indicating details about the transition. */
  message: string;
}

// ============================================================================
// IncidentSeverity
// ============================================================================

/**
 * IncidentSeveritySpec defines the desired state of IncidentSeverity.
 */
export interface IncidentSeveritySpec {
  /** DisplayName is the human-readable name (e.g., "SEV1 - Critical") */
  displayName: string;
  /** Description explains when to use this severity level */
  description?: string;
  /** Color is the hex color code for UI display (e.g., "#FF0000") */
  color?: string;
  /** Order determines sort priority (lower = more severe) */
  order?: number;
}

/**
 * IncidentSeverity defines a severity level for incidents.
 */
export interface IncidentSeverity extends TypeMeta {
  metadata: ObjectMeta;
  spec: IncidentSeveritySpec;
}

/**
 * IncidentSeverityList is a list of IncidentSeverity objects.
 */
export interface IncidentSeverityList extends TypeMeta {
  metadata: ListMeta;
  items: IncidentSeverity[];
}

// ============================================================================
// Incident
// ============================================================================

/**
 * IncidentLabel represents a key-value label for incident categorization.
 */
export interface IncidentLabel {
  /** Key is the label key */
  key: string;
  /** Value is the label value */
  value: string;
}

/**
 * RoleAssignment represents a role assigned to a user in an incident.
 */
export interface RoleAssignment {
  /** Role is the role name (e.g., "commander", "investigator", "communicator") */
  role: string;
  /** UserID is the Grafana user ID */
  userID: string;
}

/**
 * IncidentSpec defines the desired state of an Incident.
 */
export interface IncidentSpec {
  /** Title is the incident title */
  title: string;
  /** SeverityRef references an IncidentSeverity by name */
  severityRef?: string;
  /** Labels are key-value pairs for categorization */
  labels?: IncidentLabel[];
  /** IsDrill indicates if this is a practice/drill incident */
  isDrill?: boolean;
  /** Summary provides a description of the incident */
  summary?: string;
  /** Roles are the role assignments for this incident */
  roles?: RoleAssignment[];
}

/**
 * IncidentStatus defines the observed state of an Incident.
 */
export interface IncidentStatus {
  /** Phase represents the current phase of the incident (active, resolved) */
  phase?: 'active' | 'resolved' | string;
  /** IncidentID is the Grafana IRM incident ID */
  incidentID?: string;
  /** Severity is the resolved severity name */
  severity?: string;
  /** CreatedTime is when the incident was created */
  createdTime?: string;
  /** ModifiedTime is when the incident was last modified */
  modifiedTime?: string;
  /** ClosedTime is when the incident was resolved/closed */
  closedTime?: string;
  /** Conditions represent the latest available observations of the incident's state */
  conditions?: Condition[];
}

/**
 * Incident represents an incident in the system.
 */
export interface Incident extends TypeMeta {
  metadata: ObjectMeta;
  spec: IncidentSpec;
  status?: IncidentStatus;
}

/**
 * IncidentList is a list of Incident objects.
 */
export interface IncidentList extends TypeMeta {
  metadata: ListMeta;
  items: Incident[];
}

// ============================================================================
// IncidentEvent
// ============================================================================

/**
 * IncidentEventSpec defines the content of an incident event.
 */
export interface IncidentEventSpec {
  /** IncidentName is the name of the parent incident */
  incidentName: string;
  /** Body is the event content (supports markdown) */
  body: string;
  /** EventTime is when the event occurred */
  eventTime?: string;
  /** EventType is the type of event (note, status_change, etc.) */
  eventType?: 'note' | 'status_change' | string;
}

/**
 * IncidentEvent represents a timeline entry for an incident.
 */
export interface IncidentEvent extends TypeMeta {
  metadata: ObjectMeta;
  spec: IncidentEventSpec;
}

/**
 * IncidentEventList is a list of IncidentEvent objects.
 */
export interface IncidentEventList extends TypeMeta {
  metadata: ListMeta;
  items: IncidentEvent[];
}

// ============================================================================
// IncidentTask
// ============================================================================

/**
 * IncidentTaskSpec defines the desired state of an incident task.
 */
export interface IncidentTaskSpec {
  /** IncidentName is the name of the parent incident */
  incidentName: string;
  /** Text is the task description */
  text: string;
  /** AssigneeUserID is the Grafana user ID of the assignee */
  assigneeUserID?: string;
}

/**
 * IncidentTaskStatus defines the observed state of an incident task.
 */
export interface IncidentTaskStatus {
  /** TaskID is the Grafana IRM task ID */
  taskID?: string;
  /** Status is the task status (todo, progress, done) */
  status?: 'todo' | 'progress' | 'done' | string;
}

/**
 * IncidentTask represents an action item within an incident.
 */
export interface IncidentTask extends TypeMeta {
  metadata: ObjectMeta;
  spec: IncidentTaskSpec;
  status?: IncidentTaskStatus;
}

/**
 * IncidentTaskList is a list of IncidentTask objects.
 */
export interface IncidentTaskList extends TypeMeta {
  metadata: ListMeta;
  items: IncidentTask[];
}

// ============================================================================
// API Client Types
// ============================================================================

/**
 * Configuration for the API client.
 */
export interface ApiClientConfig {
  /** Base URL for the API (e.g., "/apis/incidents.operations.miloapis.com/v1alpha1") */
  baseUrl: string;
  /** Optional callback to get auth token */
  getAuthToken?: () => string | Promise<string>;
  /** Optional callback for custom fetch implementation */
  customFetch?: typeof fetch;
}

/**
 * Options for list operations.
 */
export interface ListOptions {
  /** Label selector for filtering */
  labelSelector?: string;
  /** Field selector for filtering */
  fieldSelector?: string;
  /** Maximum number of items to return */
  limit?: number;
  /** Continue token for pagination */
  continue?: string;
}

/**
 * Options for get/delete operations.
 */
export interface GetOptions {
  /** Resource version for optimistic concurrency */
  resourceVersion?: string;
}

/**
 * API error response.
 */
export interface ApiError {
  kind: 'Status';
  apiVersion: 'v1';
  metadata: Record<string, unknown>;
  status: 'Failure';
  message: string;
  reason: string;
  code: number;
}
