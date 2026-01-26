# Incidents

> [!IMPORTANT]
>
> **⚠️ Proof of Concept**: This project was vibe coded as a POC and is not
> intended for production use.

A Kubernetes aggregated API server for incident management, backed by [Grafana
IRM](https://grafana.com/products/cloud/irm/).

This project provides a Kubernetes-native interface for managing incidents,
exposing Grafana IRM functionality through standard Kubernetes APIs that
integrate seamlessly with `kubectl` and the Kubernetes ecosystem.

## Features

- **Kubernetes-native API**: Manage incidents using familiar `kubectl` commands
- **Grafana IRM integration**: Backed by Grafana's Incident Response Management
  platform
- **React UI**: Embeddable UI components for building incident management
  interfaces
- **Full incident lifecycle**: Create, update, resolve, and track incidents
- **Timeline/Events**: Track incident activities and notes
- **Task management**: Assign and track action items during incidents
- **Configurable severity levels**: Define organization-specific severity levels

## API Resources

| Resource | Description |
|----------|-------------|
| `Incident` | Core incident resource with title, severity, labels, and status |
| `IncidentSeverity` | Configuration for severity levels (SEV1, SEV2, etc.) |
| `IncidentEvent` | Timeline entries for incidents (notes, status changes) |
| `IncidentTask` | Action items assigned during incidents |

## Quick Start

### Prerequisites

- Kubernetes 1.34+ cluster
- [Grafana Cloud](https://grafana.com/products/cloud/) account with IRM enabled
- [Task](https://taskfile.dev) (for development)
- Go 1.25+ (for development)

### Deploy to Kubernetes

1. Create a secret with your Grafana IRM credentials:

```bash
kubectl create namespace incidents-system

kubectl create secret generic grafana-irm-credentials \
  --namespace incidents-system \
  --from-literal=url='https://YOUR-STACK.grafana.net/api/plugins/grafana-irm-app/resources/api/v1' \
  --from-literal=token='YOUR-SERVICE-ACCOUNT-TOKEN'
```

2. Deploy using kustomize:

```bash
kubectl apply -k config/overlays/dev
```

3. Verify the API is available:

```bash
kubectl get incidents
kubectl get incidentseverities
```

### Using kubectl

```bash
# List all incidents
kubectl get incidents

# Create an incident
kubectl create -f - <<EOF
apiVersion: incidents.operations.miloapis.com/v1alpha1
kind: Incident
metadata:
  name: database-outage
spec:
  title: "Database connection failures"
  severityRef: "sev1"
  summary: "Multiple services reporting database connection timeouts"
EOF

# Get incident details
kubectl get incident database-outage -o yaml

# List timeline events for an incident
kubectl get incidentevents --field-selector=spec.incidentName=database-outage

# Add a timeline event
kubectl create -f - <<EOF
apiVersion: incidents.operations.miloapis.com/v1alpha1
kind: IncidentEvent
metadata:
  name: event-1
spec:
  incidentName: database-outage
  body: "Identified root cause: connection pool exhaustion"
  eventType: userNote
EOF

# List tasks for an incident
kubectl get incidenttasks --field-selector=spec.incidentName=database-outage
```

## UI Components

The `ui/` directory contains a React component library
(`@datum-cloud/incidents-ui`) for building incident management interfaces.

### Installation

```bash
npm install @datum-cloud/incidents-ui
```

### Usage

```tsx
import { IncidentsProvider, IncidentList, IncidentDetail } from '@datum-cloud/incidents-ui';
import '@datum-cloud/incidents-ui/styles.css';

function App() {
  return (
    <IncidentsProvider config={{ baseUrl: '/apis/incidents.operations.miloapis.com/v1alpha1' }}>
      <IncidentList onIncidentClick={handleClick} />
    </IncidentsProvider>
  );
}
```

See [ui/README.md](ui/README.md) for full documentation.

## Development

### Build Commands

```bash
task build          # Build binary
task dev:build      # Build container image
task generate       # Run code generators
task test           # Run unit tests
task fmt            # Format code
```

### Local Development

```bash
# Start the API server locally
task build
./bin/incidents serve \
  --grafana-irm-url="https://YOUR-STACK.grafana.net/api/plugins/grafana-irm-app/resources/api/v1" \
  --grafana-irm-token="YOUR-TOKEN"

# Run the UI development server
cd ui && npm run dev
```

### Testing with a Local Cluster

```bash
# Create a test cluster
task test-infra:create

# Deploy to test cluster
task test-infra:deploy

# Access via kubectl
task test-infra:kubectl -- get incidents
```

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   kubectl / UI      │────▶│  Incidents API      │
│                     │     │  Server             │
└─────────────────────┘     └──────────┬──────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │   Grafana IRM       │
                            │   (Backend)         │
                            └─────────────────────┘
```

The API server acts as a translation layer between Kubernetes APIs and Grafana
IRM, providing:

- Kubernetes resource semantics (metadata, labels, annotations)
- Standard Kubernetes authentication/authorization
- Integration with kubectl and other Kubernetes tools
- OpenAPI/Swagger documentation

## Configuration

### API Server Flags

| Flag | Description | Required |
|------|-------------|----------|
| `--grafana-irm-url` | Grafana IRM API URL | Yes |
| `--grafana-irm-token` | Grafana service account token | Yes |
| `--secure-port` | HTTPS port (default: 6443) | No |
| `--cert-dir` | TLS certificate directory | No |

### Environment Variables

The API server reads credentials from a Kubernetes secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: grafana-irm-credentials
  namespace: incidents-system
data:
  url: <base64-encoded-url>
  token: <base64-encoded-token>
```

## License

Apache-2.0 - See [LICENSE](LICENSE) for details.
