import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IncidentsProvider } from '@/providers/IncidentsProvider';
import { IncidentsApiClient } from '@/api/client';

/**
 * Create a mock API client for testing.
 */
export function createMockApiClient(): IncidentsApiClient {
  return new IncidentsApiClient({
    baseUrl: '/test-api',
    customFetch: async () => {
      throw new Error('Mock API client - fetch not implemented');
    },
  });
}

/**
 * Create a test query client with disabled retries and caching.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface TestWrapperProps {
  children: React.ReactNode;
}

/**
 * Test wrapper that provides all necessary context providers.
 */
export function TestWrapper({ children }: TestWrapperProps) {
  const queryClient = createTestQueryClient();
  const apiClient = createMockApiClient();

  return (
    <QueryClientProvider client={queryClient}>
      <IncidentsProvider apiClient={apiClient} queryClient={queryClient}>
        {children}
      </IncidentsProvider>
    </QueryClientProvider>
  );
}

/**
 * Custom render function that wraps components with test providers.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TestWrapper, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
