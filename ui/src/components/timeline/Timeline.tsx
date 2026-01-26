import React from 'react';
import { useEventsByIncident } from '@/api/queries';
import { TimelineEntry } from './TimelineEntry';
import { TimelineForm } from './TimelineForm';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

export interface TimelineProps {
  /** Name of the incident to show timeline for */
  incidentName: string;
  /** Whether to show the form to add new events */
  showForm?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Timeline component showing all events for an incident.
 */
export function Timeline({
  incidentName,
  showForm = true,
  className,
}: TimelineProps) {
  const { data: eventsData, isLoading, error, refetch, isFetching } = useEventsByIncident(incidentName);

  // Sort events by time (newest first)
  const sortedEvents = React.useMemo(() => {
    if (!eventsData?.items) return [];
    return [...eventsData.items].sort((a, b) => {
      const aTime = a.spec.eventTime || a.metadata.creationTimestamp || '';
      const bTime = b.spec.eventTime || b.metadata.creationTimestamp || '';
      return bTime.localeCompare(aTime);
    });
  }, [eventsData]);

  if (isLoading) {
    return (
      <div className={cn('incidents-space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="incidents-flex incidents-gap-3 incidents-animate-pulse">
            <div className="incidents-h-8 incidents-w-8 incidents-rounded-full incidents-bg-muted" />
            <div className="incidents-flex-1 incidents-h-24 incidents-bg-muted incidents-rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('incidents-p-4 incidents-border incidents-border-destructive incidents-rounded-md', className)}>
        <p className="incidents-text-destructive incidents-text-sm">
          Failed to load timeline: {(error as Error).message}
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
      {/* Add event form */}
      {showForm && (
        <TimelineForm incidentName={incidentName} onCreated={() => refetch()} />
      )}

      {/* Refresh button */}
      <div className="incidents-flex incidents-justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn('incidents-h-4 incidents-w-4 incidents-mr-2', isFetching && 'incidents-animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Empty state */}
      {sortedEvents.length === 0 && (
        <div className="incidents-text-center incidents-py-8">
          <p className="incidents-text-muted-foreground">
            No timeline events yet. Add the first update above.
          </p>
        </div>
      )}

      {/* Timeline entries */}
      <div>
        {sortedEvents.map((event) => (
          <TimelineEntry key={event.metadata.name} event={event} />
        ))}
      </div>
    </div>
  );
}
