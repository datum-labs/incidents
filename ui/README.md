# @datum-cloud/incidents-ui

React UI components for Kubernetes Incident Management.

## Installation

```bash
npm install @datum-cloud/incidents-ui
```

## Usage

### Embedded in Another App

```tsx
import { IncidentsProvider, IncidentList, IncidentDetail } from '@datum-cloud/incidents-ui';
import '@datum-cloud/incidents-ui/styles.css';

function App() {
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

  return (
    <IncidentsProvider config={{ baseUrl: '/apis/incidents.operations.miloapis.com/v1alpha1' }}>
      {selectedIncident ? (
        <IncidentDetail
          incidentName={selectedIncident}
          onBack={() => setSelectedIncident(null)}
        />
      ) : (
        <IncidentList
          onIncidentClick={(incident) => setSelectedIncident(incident.metadata.name)}
        />
      )}
    </IncidentsProvider>
  );
}
```

### Standalone Development

```bash
cd ui
npm install
npm run dev
```

## Components

### Provider

- `IncidentsProvider` - Required wrapper that provides API client and React Query context

### Incident Components

- `IncidentList` - Filterable list of incidents with search
- `IncidentCard` - Summary card for a single incident
- `IncidentDetail` - Full detail view with timeline and tasks
- `IncidentForm` - Create/edit incident form
- `CreateIncidentDialog` - Modal dialog for creating new incidents

### Severity Components

- `SeverityList` - List of configured severity levels
- `SeverityBadge` - Colored badge for a severity level
- `SeveritySelect` - Dropdown selector for severity

### Timeline Components

- `Timeline` - Event timeline for an incident
- `TimelineEntry` - Single event with markdown support
- `TimelineForm` - Add new timeline event

### Task Components

- `TaskList` - List of tasks grouped by status
- `TaskItem` - Single task with status controls
- `TaskForm` - Add new task

## Hooks

For headless/custom UI implementations:

```tsx
import {
  useIncidents,
  useIncident,
  useCreateIncident,
  useSeverities,
  useEventsByIncident,
  useTasksByIncident,
} from '@datum-cloud/incidents-ui';
```

## API Client

For direct API access:

```tsx
import { createApiClient } from '@datum-cloud/incidents-ui';

const client = createApiClient({ baseUrl: '/api/k8s' });
const incidents = await client.listIncidents();
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build library
npm run build:lib

# Start Storybook
npm run storybook
```

## License

Apache-2.0
