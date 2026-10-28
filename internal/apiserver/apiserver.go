package apiserver

import (
	"context"
	"os"
	"strings"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/runtime/serializer"
	"k8s.io/apiserver/pkg/registry/rest"
	genericapiserver "k8s.io/apiserver/pkg/server"
	"k8s.io/klog/v2"

	"go.miloapis.com/incidents/internal/grafana/irm"
	_ "go.miloapis.com/incidents/internal/metrics"
	"go.miloapis.com/incidents/internal/registry/incident"
	"go.miloapis.com/incidents/internal/registry/severity"
	"go.miloapis.com/incidents/pkg/apis/incidents/install"
	"go.miloapis.com/incidents/pkg/apis/incidents/v1alpha1"
)

var (
	// Scheme defines the runtime type system for API object serialization.
	Scheme = runtime.NewScheme()
	// Codecs provides serializers for API objects.
	Codecs = serializer.NewCodecFactory(Scheme)
)

func init() {
	install.Install(Scheme)

	metav1.AddToGroupVersion(Scheme, schema.GroupVersion{Version: "v1"})

	// Register unversioned meta types required by the API machinery.
	unversioned := schema.GroupVersion{Group: "", Version: "v1"}
	Scheme.AddUnversionedTypes(unversioned,
		&metav1.Status{},
		&metav1.APIVersions{},
		&metav1.APIGroupList{},
		&metav1.APIGroup{},
		&metav1.APIResourceList{},
	)
}

// ExtraConfig extends the generic apiserver configuration with incidents-specific settings.
type ExtraConfig struct {
	// GrafanaIRMURL is the base URL for the Grafana IRM API
	GrafanaIRMURL string
	// GrafanaIRMToken is the authentication token for Grafana IRM
	GrafanaIRMToken string
}

// Config combines generic and incidents-specific configuration.
type Config struct {
	GenericConfig *genericapiserver.RecommendedConfig
	ExtraConfig   ExtraConfig
}

// IncidentsServer is the incidents aggregated apiserver.
type IncidentsServer struct {
	GenericAPIServer *genericapiserver.GenericAPIServer
}

type completedConfig struct {
	GenericConfig genericapiserver.CompletedConfig
	ExtraConfig   *ExtraConfig
}

// CompletedConfig prevents incomplete configuration from being used.
// Embeds a private pointer that can only be created via Complete().
type CompletedConfig struct {
	*completedConfig
}

// Complete validates and fills default values for the configuration.
func (cfg *Config) Complete() CompletedConfig {
	c := completedConfig{
		cfg.GenericConfig.Complete(),
		&cfg.ExtraConfig,
	}

	return CompletedConfig{&c}
}

// New creates and initializes the IncidentsServer with storage and API groups.
func (c completedConfig) New() (*IncidentsServer, error) {
	genericServer, err := c.GenericConfig.New("incidents-apiserver", genericapiserver.NewEmptyDelegate())
	if err != nil {
		return nil, err
	}

	s := &IncidentsServer{
		GenericAPIServer: genericServer,
	}

	// Initialize Grafana IRM client.
	// When GRAFANA_IRM_STUB=true the stub no-op client is used so the server
	// can start without real credentials (e.g. in a local kind demo cluster).
	var irmClient irm.Interface
	if os.Getenv("GRAFANA_IRM_STUB") == "true" {
		klog.Info("GRAFANA_IRM_STUB=true: using in-memory IRM stub client")
		irmClient = irm.NewStubClient()
	} else {
		irmClient = irm.NewClient(
			c.ExtraConfig.GrafanaIRMURL,
			strings.TrimSpace(c.ExtraConfig.GrafanaIRMToken),
		)
	}

	// Create storage implementations
	severityStorage := severity.NewStorage(Scheme)
	incidentStorage := incident.NewStorage(irmClient, Scheme)
	eventStorage := incident.NewEventStorage(irmClient, incidentStorage)
	taskStorage := incident.NewTaskStorage(irmClient, incidentStorage)

	apiGroupInfo := genericapiserver.NewDefaultAPIGroupInfo(v1alpha1.GroupName, Scheme, metav1.ParameterCodec, Codecs)

	v1alpha1Storage := map[string]rest.Storage{
		"incidentseverities": severityStorage,
		"incidents":          incidentStorage,
		"incidentevents":     eventStorage,
		"incidenttasks":      taskStorage,
	}

	apiGroupInfo.VersionedResourcesStorageMap["v1alpha1"] = v1alpha1Storage

	if err := s.GenericAPIServer.InstallAPIGroup(&apiGroupInfo); err != nil {
		return nil, err
	}

	klog.Info("Incidents server initialized successfully")
	klog.Infof("Grafana IRM URL: %s", c.ExtraConfig.GrafanaIRMURL)

	return s, nil
}

// Run starts the server.
func (s *IncidentsServer) Run(ctx context.Context) error {
	return s.GenericAPIServer.PrepareRun().RunWithContext(ctx)
}
