import type {
  ApiClientConfig,
  ApiError,
  GetOptions,
  Incident,
  IncidentEvent,
  IncidentEventList,
  IncidentList,
  IncidentSeverity,
  IncidentSeverityList,
  IncidentTask,
  IncidentTaskList,
  ListOptions,
} from '@/types/api';

const API_GROUP = 'incidents.operations.miloapis.com';
const API_VERSION = 'v1alpha1';

/**
 * Build the default base URL for the incidents API.
 */
export function getDefaultBaseUrl(): string {
  return `/apis/${API_GROUP}/${API_VERSION}`;
}

/**
 * API client for the Incidents Kubernetes API.
 */
export class IncidentsApiClient {
  private config: ApiClientConfig;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || getDefaultBaseUrl(),
      getAuthToken: config.getAuthToken,
      customFetch: config.customFetch,
    };
  }

  private async fetch<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (this.config.getAuthToken) {
      const token = await Promise.resolve(this.config.getAuthToken());
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    const fetchFn = this.config.customFetch || fetch;
    const response = await fetchFn(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorBody: ApiError | null = null;
      try {
        errorBody = await response.json();
      } catch {
        // Ignore JSON parse errors
      }

      const error = new Error(
        errorBody?.message || `API request failed: ${response.status} ${response.statusText}`
      );
      (error as Error & { status: number; apiError?: ApiError }).status = response.status;
      (error as Error & { apiError?: ApiError }).apiError = errorBody || undefined;
      throw error;
    }

    return response.json();
  }

  private buildQueryString(options?: ListOptions | GetOptions): string {
    if (!options) return '';

    const params = new URLSearchParams();
    const listOpts = options as ListOptions;

    if (listOpts.labelSelector) params.set('labelSelector', listOpts.labelSelector);
    if (listOpts.fieldSelector) params.set('fieldSelector', listOpts.fieldSelector);
    if (listOpts.limit) params.set('limit', String(listOpts.limit));
    if (listOpts.continue) params.set('continue', listOpts.continue);

    const query = params.toString();
    return query ? `?${query}` : '';
  }

  // ============================================================================
  // IncidentSeverity Operations
  // ============================================================================

  async listSeverities(options?: ListOptions): Promise<IncidentSeverityList> {
    return this.fetch<IncidentSeverityList>(`/incidentseverities${this.buildQueryString(options)}`);
  }

  async getSeverity(name: string, options?: GetOptions): Promise<IncidentSeverity> {
    return this.fetch<IncidentSeverity>(`/incidentseverities/${name}${this.buildQueryString(options)}`);
  }

  async createSeverity(severity: Omit<IncidentSeverity, 'kind' | 'apiVersion'>): Promise<IncidentSeverity> {
    return this.fetch<IncidentSeverity>('/incidentseverities', {
      method: 'POST',
      body: JSON.stringify({
        ...severity,
        kind: 'IncidentSeverity',
        apiVersion: `${API_GROUP}/${API_VERSION}`,
      }),
    });
  }

  async updateSeverity(name: string, severity: Omit<IncidentSeverity, 'kind' | 'apiVersion'>): Promise<IncidentSeverity> {
    return this.fetch<IncidentSeverity>(`/incidentseverities/${name}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...severity,
        kind: 'IncidentSeverity',
        apiVersion: `${API_GROUP}/${API_VERSION}`,
      }),
    });
  }

  async deleteSeverity(name: string): Promise<void> {
    await this.fetch<unknown>(`/incidentseverities/${name}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // Incident Operations
  // ============================================================================

  async listIncidents(options?: ListOptions): Promise<IncidentList> {
    return this.fetch<IncidentList>(`/incidents${this.buildQueryString(options)}`);
  }

  async getIncident(name: string, options?: GetOptions): Promise<Incident> {
    return this.fetch<Incident>(`/incidents/${name}${this.buildQueryString(options)}`);
  }

  async createIncident(incident: Omit<Incident, 'kind' | 'apiVersion' | 'status'>): Promise<Incident> {
    return this.fetch<Incident>('/incidents', {
      method: 'POST',
      body: JSON.stringify({
        ...incident,
        kind: 'Incident',
        apiVersion: `${API_GROUP}/${API_VERSION}`,
      }),
    });
  }

  async updateIncident(name: string, incident: Omit<Incident, 'kind' | 'apiVersion'>): Promise<Incident> {
    return this.fetch<Incident>(`/incidents/${name}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...incident,
        kind: 'Incident',
        apiVersion: `${API_GROUP}/${API_VERSION}`,
      }),
    });
  }

  async deleteIncident(name: string): Promise<void> {
    await this.fetch<unknown>(`/incidents/${name}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // IncidentEvent Operations
  // ============================================================================

  async listEvents(options?: ListOptions): Promise<IncidentEventList> {
    return this.fetch<IncidentEventList>(`/incidentevents${this.buildQueryString(options)}`);
  }

  async listEventsByIncident(incidentName: string, options?: ListOptions): Promise<IncidentEventList> {
    const selectorOptions: ListOptions = {
      ...options,
      fieldSelector: `spec.incidentName=${incidentName}`,
    };
    return this.listEvents(selectorOptions);
  }

  async getEvent(name: string, options?: GetOptions): Promise<IncidentEvent> {
    return this.fetch<IncidentEvent>(`/incidentevents/${name}${this.buildQueryString(options)}`);
  }

  async createEvent(event: Omit<IncidentEvent, 'kind' | 'apiVersion'>): Promise<IncidentEvent> {
    return this.fetch<IncidentEvent>('/incidentevents', {
      method: 'POST',
      body: JSON.stringify({
        ...event,
        kind: 'IncidentEvent',
        apiVersion: `${API_GROUP}/${API_VERSION}`,
      }),
    });
  }

  async deleteEvent(name: string): Promise<void> {
    await this.fetch<unknown>(`/incidentevents/${name}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // IncidentTask Operations
  // ============================================================================

  async listTasks(options?: ListOptions): Promise<IncidentTaskList> {
    return this.fetch<IncidentTaskList>(`/incidenttasks${this.buildQueryString(options)}`);
  }

  async listTasksByIncident(incidentName: string, options?: ListOptions): Promise<IncidentTaskList> {
    const selectorOptions: ListOptions = {
      ...options,
      fieldSelector: `spec.incidentName=${incidentName}`,
    };
    return this.listTasks(selectorOptions);
  }

  async getTask(name: string, options?: GetOptions): Promise<IncidentTask> {
    return this.fetch<IncidentTask>(`/incidenttasks/${name}${this.buildQueryString(options)}`);
  }

  async createTask(task: Omit<IncidentTask, 'kind' | 'apiVersion' | 'status'>): Promise<IncidentTask> {
    return this.fetch<IncidentTask>('/incidenttasks', {
      method: 'POST',
      body: JSON.stringify({
        ...task,
        kind: 'IncidentTask',
        apiVersion: `${API_GROUP}/${API_VERSION}`,
      }),
    });
  }

  async updateTask(name: string, task: Omit<IncidentTask, 'kind' | 'apiVersion'>): Promise<IncidentTask> {
    return this.fetch<IncidentTask>(`/incidenttasks/${name}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...task,
        kind: 'IncidentTask',
        apiVersion: `${API_GROUP}/${API_VERSION}`,
      }),
    });
  }

  async deleteTask(name: string): Promise<void> {
    await this.fetch<unknown>(`/incidenttasks/${name}`, {
      method: 'DELETE',
    });
  }
}

/**
 * Create an API client instance.
 */
export function createApiClient(config?: Partial<ApiClientConfig>): IncidentsApiClient {
  return new IncidentsApiClient(config);
}
