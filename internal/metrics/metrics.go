package metrics

import (
	"k8s.io/component-base/metrics"
	"k8s.io/component-base/metrics/legacyregistry"
)

const (
	namespace = "incidents"
)

var (
	// IncidentOperationsTotal tracks the total number of incident operations
	IncidentOperationsTotal = metrics.NewCounterVec(
		&metrics.CounterOpts{
			Namespace:      namespace,
			Name:           "operations_total",
			Help:           "Total number of incident operations",
			StabilityLevel: metrics.ALPHA,
		},
		[]string{"operation", "status"},
	)

	// IncidentOperationDuration tracks the duration of incident operations
	IncidentOperationDuration = metrics.NewHistogramVec(
		&metrics.HistogramOpts{
			Namespace:      namespace,
			Name:           "operation_duration_seconds",
			Help:           "Duration of incident operations in seconds",
			StabilityLevel: metrics.ALPHA,
			Buckets:        metrics.ExponentialBuckets(0.001, 2, 14),
		},
		[]string{"operation"},
	)

	// GrafanaIRMRequestsTotal tracks the total number of requests to Grafana IRM
	GrafanaIRMRequestsTotal = metrics.NewCounterVec(
		&metrics.CounterOpts{
			Namespace:      namespace,
			Name:           "grafana_irm_requests_total",
			Help:           "Total number of requests to Grafana IRM",
			StabilityLevel: metrics.ALPHA,
		},
		[]string{"method", "status"},
	)
)

// init registers all custom metrics with the legacy registry
// This ensures they're included in the /metrics endpoint
func init() {
	legacyregistry.MustRegister(
		IncidentOperationsTotal,
		IncidentOperationDuration,
		GrafanaIRMRequestsTotal,
	)
}
