import React from 'react';
import ReactDOM from 'react-dom/client';
import { IncidentsProvider } from './providers/IncidentsProvider';
import { IncidentList } from './components/incidents/IncidentList';
import { IncidentDetail } from './components/incidents/IncidentDetail';
import { CreateIncidentDialog } from './components/incidents/CreateIncidentDialog';
import { SeverityListCard } from './components/severity/SeverityList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import './styles/globals.css';

/**
 * Milo Logo component
 */
function MiloLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <text
        x="0"
        y="19"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="currentColor"
      >
        milo
      </text>
    </svg>
  );
}

/**
 * Standalone application for Milo Incident Management.
 */
function App() {
  const [selectedIncident, setSelectedIncident] = React.useState<string | null>(null);

  return (
    <IncidentsProvider
      config={{
        // Default to the standard Kubernetes API path
        // In development, you may need to set up a proxy or use a different URL
        baseUrl: '/apis/incidents.operations.miloapis.com/v1alpha1',
      }}
    >
      <div className="incidents-min-h-screen incidents-bg-background incidents-text-foreground incidents-flex incidents-flex-col">
        {/* Header */}
        <header className="incidents-border-b incidents-bg-card">
          <div className="incidents-container incidents-mx-auto incidents-px-4 incidents-py-3">
            <div className="incidents-flex incidents-items-center incidents-justify-between">
              <div className="incidents-flex incidents-items-center incidents-gap-4">
                <MiloLogo className="incidents-h-6 incidents-w-auto" />
                <div className="incidents-h-6 incidents-w-px incidents-bg-border" />
                <div>
                  <h1 className="incidents-text-lg incidents-font-semibold">Incidents</h1>
                </div>
              </div>
              <CreateIncidentDialog
                onCreated={(name) => setSelectedIncident(name)}
              />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="incidents-container incidents-mx-auto incidents-px-4 incidents-py-6 incidents-flex-1">
          {selectedIncident ? (
            /* Incident detail view */
            <IncidentDetail
              incidentName={selectedIncident}
              onBack={() => setSelectedIncident(null)}
              onDeleted={() => setSelectedIncident(null)}
            />
          ) : (
            /* Dashboard view */
            <Tabs defaultValue="incidents" className="incidents-space-y-4">
              <TabsList>
                <TabsTrigger value="incidents">Incidents</TabsTrigger>
                <TabsTrigger value="severities">Severities</TabsTrigger>
              </TabsList>

              <TabsContent value="incidents">
                <IncidentList
                  onIncidentClick={(incident) =>
                    setSelectedIncident(incident.metadata.name)
                  }
                  selectedIncident={selectedIncident || undefined}
                />
              </TabsContent>

              <TabsContent value="severities">
                <SeverityListCard />
              </TabsContent>
            </Tabs>
          )}
        </main>

        {/* Footer */}
        <footer className="incidents-border-t incidents-bg-card">
          <div className="incidents-container incidents-mx-auto incidents-px-4 incidents-py-4">
            <div className="incidents-flex incidents-items-center incidents-justify-between incidents-text-sm incidents-text-muted-foreground">
              <p>Milo Incident Management</p>
              <p>&copy; {new Date().getFullYear()} Datum Cloud</p>
            </div>
          </div>
        </footer>
      </div>
    </IncidentsProvider>
  );
}

// Mount the app
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
