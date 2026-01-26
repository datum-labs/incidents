import React from 'react';
import { useSeverities } from '@/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeverityBadge } from './SeverityBadge';
import { cn } from '@/lib/utils';

export interface SeverityListProps {
  /** Callback when a severity is clicked */
  onSeverityClick?: (severityName: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * List of all configured severity levels.
 */
export function SeverityList({ onSeverityClick, className }: SeverityListProps) {
  const { data: severitiesData, isLoading, error } = useSeverities();

  // Sort severities by order (lower = more severe = first)
  const sortedSeverities = React.useMemo(() => {
    if (!severitiesData?.items) return [];
    return [...severitiesData.items].sort(
      (a, b) => (a.spec.order ?? 0) - (b.spec.order ?? 0)
    );
  }, [severitiesData]);

  if (isLoading) {
    return (
      <div className={cn('incidents-space-y-2', className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="incidents-animate-pulse">
            <CardContent className="incidents-p-4">
              <div className="incidents-h-6 incidents-bg-muted incidents-rounded incidents-w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className={cn('incidents-border-destructive', className)}>
        <CardContent className="incidents-p-4">
          <p className="incidents-text-destructive incidents-text-sm">
            Failed to load severities: {(error as Error).message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (sortedSeverities.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="incidents-p-6 incidents-text-center">
          <p className="incidents-text-muted-foreground incidents-text-sm">
            No severity levels configured
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('incidents-space-y-2', className)}>
      {sortedSeverities.map((severity) => (
        <Card
          key={severity.metadata.name}
          className={cn(
            'incidents-transition-colors',
            onSeverityClick && 'hover:incidents-bg-accent incidents-cursor-pointer'
          )}
          onClick={() => onSeverityClick?.(severity.metadata.name)}
        >
          <CardContent className="incidents-p-4">
            <div className="incidents-flex incidents-items-center incidents-justify-between">
              <div className="incidents-flex incidents-items-center incidents-gap-3">
                <SeverityBadge severity={severity} />
                {severity.spec.description && (
                  <span className="incidents-text-sm incidents-text-muted-foreground">
                    {severity.spec.description}
                  </span>
                )}
              </div>
              <span className="incidents-text-xs incidents-text-muted-foreground">
                Order: {severity.spec.order ?? 0}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export interface SeverityListCardProps extends SeverityListProps {
  /** Card title */
  title?: string;
}

/**
 * Severity list wrapped in a card with a header.
 */
export function SeverityListCard({
  title = 'Severity Levels',
  ...props
}: SeverityListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <SeverityList {...props} />
      </CardContent>
    </Card>
  );
}
