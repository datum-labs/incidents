package main

import (
	"context"
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	incidentsapiserver "go.miloapis.com/incidents/internal/apiserver"
	"go.miloapis.com/incidents/internal/version"
	"go.miloapis.com/incidents/pkg/generated/openapi"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	apiopenapi "k8s.io/apiserver/pkg/endpoints/openapi"
	genericapiserver "k8s.io/apiserver/pkg/server"
	"k8s.io/apiserver/pkg/server/options"
	utilfeature "k8s.io/apiserver/pkg/util/feature"
	"k8s.io/component-base/cli"
	basecompatibility "k8s.io/component-base/compatibility"
	"k8s.io/component-base/logs"
	logsapi "k8s.io/component-base/logs/api/v1"
	"k8s.io/klog/v2"

	// Register JSON logging format
	_ "k8s.io/component-base/logs/json/register"
)

func init() {
	utilruntime.Must(logsapi.AddFeatureGates(utilfeature.DefaultMutableFeatureGate))
	utilfeature.DefaultMutableFeatureGate.Set("LoggingBetaOptions=true")
	utilfeature.DefaultMutableFeatureGate.Set("RemoteRequestHeaderUID=true")
}

func main() {
	cmd := NewIncidentsServerCommand()
	code := cli.Run(cmd)
	os.Exit(code)
}

// NewIncidentsServerCommand creates the root command with subcommands for the incidents server.
func NewIncidentsServerCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "incidents",
		Short: "Incidents - Kubernetes aggregated API for incident management",
		Long: `Incidents is a Kubernetes aggregated API server that provides incident management
capabilities backed by Grafana IRM.

Exposes Incident, IncidentSeverity, IncidentEvent, and IncidentTask resources
accessible through kubectl or any Kubernetes client.`,
	}

	cmd.AddCommand(NewServeCommand())
	cmd.AddCommand(NewVersionCommand())

	return cmd
}

// NewServeCommand creates the serve subcommand that starts the API server.
func NewServeCommand() *cobra.Command {
	options := NewIncidentsServerOptions()

	cmd := &cobra.Command{
		Use:   "serve",
		Short: "Start the API server",
		Long: `Start the Incidents API server and begin serving requests.

Exposes Incident resources through kubectl.`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := options.Complete(); err != nil {
				return err
			}
			if err := options.Validate(); err != nil {
				return err
			}
			return Run(options, cmd.Context())
		},
	}

	flags := cmd.Flags()
	options.AddFlags(flags)

	// Add logging flags - this includes the -v flag for verbosity
	logsapi.AddFlags(options.Logs, flags)

	return cmd
}

// NewVersionCommand creates the version subcommand to display build information.
func NewVersionCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "version",
		Short: "Show version information",
		Long:  `Show the version, git commit, and build details.`,
		Run: func(cmd *cobra.Command, args []string) {
			info := version.Get()
			fmt.Printf("Incidents Server\n")
			fmt.Printf("  Version:       %s\n", info.Version)
			fmt.Printf("  Git Commit:    %s\n", info.GitCommit)
			fmt.Printf("  Git Tree:      %s\n", info.GitTreeState)
			fmt.Printf("  Build Date:    %s\n", info.BuildDate)
			fmt.Printf("  Go Version:    %s\n", info.GoVersion)
			fmt.Printf("  Go Compiler:   %s\n", info.Compiler)
			fmt.Printf("  Platform:      %s\n", info.Platform)
		},
	}

	return cmd
}

// IncidentsServerOptions contains configuration for the incidents server.
type IncidentsServerOptions struct {
	RecommendedOptions *options.RecommendedOptions
	Logs               *logsapi.LoggingConfiguration

	// Grafana IRM configuration
	GrafanaIRMURL       string
	GrafanaIRMTokenFile string
}

// NewIncidentsServerOptions creates options with default values.
func NewIncidentsServerOptions() *IncidentsServerOptions {
	o := &IncidentsServerOptions{
		RecommendedOptions: options.NewRecommendedOptions(
			"/registry/incidents.operations.miloapis.com",
			incidentsapiserver.Codecs.LegacyCodec(incidentsapiserver.Scheme.PrioritizedVersionsAllGroups()...),
		),
		Logs: logsapi.NewLoggingConfiguration(),
	}

	// Disable etcd since storage implementation is external (Grafana IRM)
	o.RecommendedOptions.Etcd = nil

	// Disable admission plugins since this server doesn't mutate or validate resources.
	o.RecommendedOptions.Admission = nil

	return o
}

func (o *IncidentsServerOptions) AddFlags(fs *pflag.FlagSet) {
	o.RecommendedOptions.AddFlags(fs)

	// Grafana IRM flags
	fs.StringVar(&o.GrafanaIRMURL, "grafana-irm-url", "",
		"URL of the Grafana IRM API (e.g., https://your-stack.grafana.net/api/plugins/grafana-irm-app/resources/api/v1)")
	fs.StringVar(&o.GrafanaIRMTokenFile, "grafana-irm-token-file", "",
		"Path to file containing Grafana IRM API token")
}

func (o *IncidentsServerOptions) Complete() error {
	return nil
}

// Validate ensures required configuration is provided.
func (o *IncidentsServerOptions) Validate() error {
	if o.GrafanaIRMURL == "" {
		return fmt.Errorf("--grafana-irm-url is required")
	}
	if o.GrafanaIRMTokenFile == "" {
		return fmt.Errorf("--grafana-irm-token-file is required")
	}
	return nil
}

// Config builds the complete server configuration from options.
func (o *IncidentsServerOptions) Config() (*incidentsapiserver.Config, error) {
	if err := o.RecommendedOptions.SecureServing.MaybeDefaultWithSelfSignedCerts(
		"localhost", nil, nil); err != nil {
		return nil, fmt.Errorf("error creating self-signed certificates: %v", err)
	}

	// Read Grafana IRM token from file
	tokenBytes, err := os.ReadFile(o.GrafanaIRMTokenFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read Grafana IRM token file: %w", err)
	}
	grafanaToken := string(tokenBytes)

	genericConfig := genericapiserver.NewRecommendedConfig(incidentsapiserver.Codecs)

	// Set effective version to match the Kubernetes version we're built against.
	genericConfig.EffectiveVersion = basecompatibility.NewEffectiveVersionFromString("1.34", "", "")

	namer := apiopenapi.NewDefinitionNamer(incidentsapiserver.Scheme)
	genericConfig.OpenAPIV3Config = genericapiserver.DefaultOpenAPIV3Config(openapi.GetOpenAPIDefinitions, namer)
	genericConfig.OpenAPIV3Config.Info.Title = "Incidents"
	genericConfig.OpenAPIV3Config.Info.Version = version.Version

	// Configure OpenAPI v2
	genericConfig.OpenAPIConfig = genericapiserver.DefaultOpenAPIConfig(openapi.GetOpenAPIDefinitions, namer)
	genericConfig.OpenAPIConfig.Info.Title = "Incidents"
	genericConfig.OpenAPIConfig.Info.Version = version.Version

	if err := o.RecommendedOptions.ApplyTo(genericConfig); err != nil {
		return nil, fmt.Errorf("failed to apply recommended options: %w", err)
	}

	serverConfig := &incidentsapiserver.Config{
		GenericConfig: genericConfig,
		ExtraConfig: incidentsapiserver.ExtraConfig{
			GrafanaIRMURL:   o.GrafanaIRMURL,
			GrafanaIRMToken: grafanaToken,
		},
	}

	return serverConfig, nil
}

// Run initializes and starts the server.
func Run(options *IncidentsServerOptions, ctx context.Context) error {
	if err := logsapi.ValidateAndApply(options.Logs, utilfeature.DefaultMutableFeatureGate); err != nil {
		return fmt.Errorf("failed to apply logging configuration: %w", err)
	}

	config, err := options.Config()
	if err != nil {
		return err
	}

	server, err := config.Complete().New()
	if err != nil {
		return err
	}

	defer logs.FlushLogs()

	klog.Info("Starting Incidents server...")
	klog.Info("Metrics available at https://<server-address>/metrics")
	return server.Run(ctx)
}
