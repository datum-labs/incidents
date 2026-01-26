import React, { createContext, useContext, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IncidentsApiClient, createApiClient } from '@/api/client';
import type { ApiClientConfig } from '@/types/api';

/**
 * Context value for the Incidents provider.
 */
interface IncidentsContextValue {
  /** The API client instance */
  apiClient: IncidentsApiClient;
}

const IncidentsContext = createContext<IncidentsContextValue | null>(null);

/**
 * Props for the IncidentsProvider component.
 */
export interface IncidentsProviderProps {
  /** API client configuration */
  config?: Partial<ApiClientConfig>;
  /** Optional pre-configured API client (overrides config) */
  apiClient?: IncidentsApiClient;
  /** Optional pre-configured QueryClient */
  queryClient?: QueryClient;
  /** Child components */
  children: React.ReactNode;
}

// Default query client configuration
const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Provider component that wraps the application with Incidents API context.
 * This must be used at the root of any component tree that uses incident components.
 *
 * @example
 * ```tsx
 * import { IncidentsProvider, IncidentList } from '@datum-cloud/incidents-ui';
 *
 * function App() {
 *   return (
 *     <IncidentsProvider config={{ baseUrl: '/api/k8s' }}>
 *       <IncidentList />
 *     </IncidentsProvider>
 *   );
 * }
 * ```
 */
export function IncidentsProvider({
  config,
  apiClient: providedApiClient,
  queryClient,
  children,
}: IncidentsProviderProps) {
  const apiClient = useMemo(
    () => providedApiClient || createApiClient(config),
    [providedApiClient, config]
  );

  const qc = queryClient || defaultQueryClient;

  const contextValue = useMemo(() => ({ apiClient }), [apiClient]);

  return (
    <QueryClientProvider client={qc}>
      <IncidentsContext.Provider value={contextValue}>
        {children}
      </IncidentsContext.Provider>
    </QueryClientProvider>
  );
}

/**
 * Hook to access the Incidents context.
 * Must be used within an IncidentsProvider.
 */
export function useIncidentsContext(): IncidentsContextValue {
  const context = useContext(IncidentsContext);
  if (!context) {
    throw new Error('useIncidentsContext must be used within an IncidentsProvider');
  }
  return context;
}

/**
 * Hook to access the API client directly.
 */
export function useApiClient(): IncidentsApiClient {
  return useIncidentsContext().apiClient;
}
