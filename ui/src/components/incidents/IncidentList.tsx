import React from 'react';
import { useIncidents } from '@/api/queries';
import { IncidentCard } from './IncidentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Incident, ListOptions } from '@/types/api';
import { Search, RefreshCw, Filter } from 'lucide-react';

export interface IncidentListProps {
  /** Callback when an incident is clicked */
  onIncidentClick?: (incident: Incident) => void;
  /** Currently selected incident name */
  selectedIncident?: string;
  /** Filter to only show active or resolved incidents */
  statusFilter?: 'active' | 'resolved' | 'all';
  /** Additional list options for the API */
  listOptions?: ListOptions;
  /** Whether to show the search/filter controls */
  showControls?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * List of incidents with filtering and search capabilities.
 */
export function IncidentList({
  onIncidentClick,
  selectedIncident,
  statusFilter = 'all',
  listOptions,
  showControls = true,
  className,
}: IncidentListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [localStatusFilter, setLocalStatusFilter] = React.useState(statusFilter);

  const { data: incidentsData, isLoading, error, refetch, isFetching } = useIncidents(listOptions);

  // Filter incidents based on search and status
  const filteredIncidents = React.useMemo(() => {
    if (!incidentsData?.items) return [];

    return incidentsData.items
      .filter((incident) => {
        // Status filter
        if (localStatusFilter !== 'all') {
          const phase = incident.status?.phase || 'active';
          if (phase !== localStatusFilter) return false;
        }

        // Search filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const title = incident.spec.title.toLowerCase();
          const summary = incident.spec.summary?.toLowerCase() || '';
          const name = incident.metadata.name.toLowerCase();

          if (!title.includes(term) && !summary.includes(term) && !name.includes(term)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Sort active incidents first, then by creation time
        const aPhase = a.status?.phase || 'active';
        const bPhase = b.status?.phase || 'active';

        if (aPhase !== bPhase) {
          return aPhase === 'active' ? -1 : 1;
        }

        const aTime = a.status?.createdTime || a.metadata.creationTimestamp || '';
        const bTime = b.status?.createdTime || b.metadata.creationTimestamp || '';
        return bTime.localeCompare(aTime);
      });
  }, [incidentsData, localStatusFilter, searchTerm]);

  const activeCount = incidentsData?.items.filter(
    (i) => (i.status?.phase || 'active') === 'active'
  ).length || 0;

  const resolvedCount = incidentsData?.items.filter(
    (i) => i.status?.phase === 'resolved'
  ).length || 0;

  if (error) {
    return (
      <div className={cn('incidents-p-4 incidents-border incidents-border-destructive incidents-rounded-md', className)}>
        <p className="incidents-text-destructive incidents-text-sm">
          Failed to load incidents: {(error as Error).message}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="incidents-mt-2">
          <RefreshCw className="incidents-h-4 incidents-w-4 incidents-mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('incidents-space-y-4', className)}>
      {showControls && (
        <div className="incidents-space-y-3">
          {/* Search */}
          <div className="incidents-relative">
            <Search className="incidents-absolute incidents-left-3 incidents-top-1/2 incidents--translate-y-1/2 incidents-h-4 incidents-w-4 incidents-text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="incidents-pl-10"
            />
          </div>

          {/* Filter tabs */}
          <div className="incidents-flex incidents-items-center incidents-gap-2">
            <Filter className="incidents-h-4 incidents-w-4 incidents-text-muted-foreground" />
            <div className="incidents-flex incidents-gap-1">
              <Button
                variant={localStatusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLocalStatusFilter('all')}
              >
                All
                <Badge variant="secondary" className="incidents-ml-1.5">
                  {(incidentsData?.items.length || 0)}
                </Badge>
              </Button>
              <Button
                variant={localStatusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLocalStatusFilter('active')}
              >
                Active
                <Badge variant="active" className="incidents-ml-1.5">
                  {activeCount}
                </Badge>
              </Button>
              <Button
                variant={localStatusFilter === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLocalStatusFilter('resolved')}
              >
                Resolved
                <Badge variant="resolved" className="incidents-ml-1.5">
                  {resolvedCount}
                </Badge>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              className="incidents-ml-auto"
            >
              <RefreshCw className={cn('incidents-h-4 incidents-w-4', isFetching && 'incidents-animate-spin')} />
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="incidents-space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="incidents-animate-pulse">
              <div className="incidents-h-32 incidents-bg-muted incidents-rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredIncidents.length === 0 && (
        <div className="incidents-text-center incidents-py-12">
          <p className="incidents-text-muted-foreground">
            {searchTerm || localStatusFilter !== 'all'
              ? 'No incidents match your filters'
              : 'No incidents found'}
          </p>
        </div>
      )}

      {/* Incident list */}
      {!isLoading && filteredIncidents.length > 0 && (
        <div className="incidents-space-y-3">
          {filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.metadata.name}
              incident={incident}
              onClick={() => onIncidentClick?.(incident)}
              selected={selectedIncident === incident.metadata.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
