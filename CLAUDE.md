# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Go template repository for building Kubernetes aggregated API servers. It provides scaffolding for creating custom Kubernetes APIs that integrate with `kubectl` and the Kubernetes ecosystem.

## Build Commands

This project uses [Task](https://taskfile.dev) for build automation:

```bash
task build          # Build binary to bin/example-service with version injection
task dev:build      # Build container image
task generate       # Run deepcopy code generator
task test           # Run unit tests (go test -v ./...)
task fmt            # Format code with gofmt
task vet            # Run go vet
task clean          # Remove build artifacts
```

## Architecture

### Core Components

- **`cmd/example-service/main.go`**: CLI entry point using Cobra. Provides `serve` and `version` commands.

- **`internal/apiserver/apiserver.go`**: Core API server initialization. Extends Kubernetes generic API server, manages API group registration, and configures OpenAPI schemas. **Key customization point**: REST storage implementations are registered here (see the `TEMPLATE NOTE` comment around line 94).

- **`pkg/apis/example-service/v1alpha1/types.go`**: Custom resource type definitions (`ExampleResource`). Controls whether resources are namespaced vs cluster-scoped and which HTTP verbs are allowed via `+genclient` directives.

- **`internal/metrics/metrics.go`**: Prometheus metrics integration.

- **`internal/version/version.go`**: Version info injected at build time via ldflags.

### Kubernetes Deployment

Uses Kustomize with a base + overlays + components pattern:
- `config/base/`: Core deployment resources
- `config/overlays/dev/`: Development environment
- `config/components/`: Optional features (namespace, api-registration, cert-manager-ca, observability, tracing)

## Template Customization

When using this template, perform global find-and-replace:

| Find | Replace With |
|------|-------------|
| `github.com/example-org/example-service` | Your module path |
| `example.example-org.io` | Your API group |
| `ghcr.io/example-org/example-service` | Your container registry |
| `example-service` | Your service name |
| `ExampleResource` | Your resource type |

Then rename directories:
```bash
mv cmd/example-service cmd/yourservice
mv pkg/apis/example-service pkg/apis/yourservice
```

Search for `TEMPLATE NOTE` comments throughout the codebase to find all customization points.

## Key Implementation Notes

- REST storage implementations must be added in `internal/apiserver/apiserver.go` to handle CRUD operations
- The `+genclient` directives in `types.go` control code generation (namespaced vs cluster-scoped, allowed verbs)
- Run `task generate` after modifying API types to regenerate deepcopy code
- Container runs as non-root user (65532) with read-only filesystem
