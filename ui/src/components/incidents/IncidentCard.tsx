import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SeverityBadge } from '@/components/severity/SeverityBadge';
import { useSeverity } from '@/api/queries';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Incident } from '@/types/api';
import { AlertCircle, Clock, Users } from 'lucide-react';

export interface IncidentCardProps {
  /** The incident to display */
  incident: Incident;
  /** Callback when the card is clicked */
  onClick?: () => void;
  /** Whether this card is currently selected */
  selected?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Card component displaying an incident summary.
 */
export function IncidentCard({
  incident,
  onClick,
  selected,
  className,
}: IncidentCardProps) {
  const { data: severity } = useSeverity(incident.spec.severityRef || '');

  const phase = incident.status?.phase || 'active';
  const isActive = phase === 'active';
  const isDrill = incident.spec.isDrill;

  return (
    <Card
      className={cn(
        'incidents-transition-all incidents-cursor-pointer hover:incidents-shadow-md',
        selected && 'incidents-ring-2 incidents-ring-primary',
        isActive && 'incidents-border-l-4 incidents-border-l-status-active',
        !isActive && 'incidents-border-l-4 incidents-border-l-status-resolved',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="incidents-pb-2">
        <div className="incidents-flex incidents-items-start incidents-justify-between incidents-gap-2">
          <CardTitle className="incidents-text-base incidents-font-medium incidents-line-clamp-2">
            {incident.spec.title}
          </CardTitle>
          <div className="incidents-flex incidents-items-center incidents-gap-1.5 incidents-shrink-0">
            {isDrill && (
              <Badge variant="drill" className="incidents-text-xs">
                Drill
              </Badge>
            )}
            <Badge variant={isActive ? 'active' : 'resolved'} className="incidents-text-xs">
              {phase}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="incidents-pt-0">
        <div className="incidents-flex incidents-flex-wrap incidents-items-center incidents-gap-3 incidents-text-sm incidents-text-muted-foreground">
          {severity && (
            <div className="incidents-flex incidents-items-center incidents-gap-1.5">
              <AlertCircle className="incidents-h-3.5 incidents-w-3.5" />
              <SeverityBadge severity={severity} className="incidents-text-xs" />
            </div>
          )}

          {incident.status?.createdTime && (
            <div className="incidents-flex incidents-items-center incidents-gap-1.5">
              <Clock className="incidents-h-3.5 incidents-w-3.5" />
              <span>{formatRelativeTime(incident.status.createdTime)}</span>
            </div>
          )}

          {incident.spec.roles && incident.spec.roles.length > 0 && (
            <div className="incidents-flex incidents-items-center incidents-gap-1.5">
              <Users className="incidents-h-3.5 incidents-w-3.5" />
              <span>{incident.spec.roles.length} assigned</span>
            </div>
          )}
        </div>

        {incident.spec.summary && (
          <p className="incidents-mt-2 incidents-text-sm incidents-text-muted-foreground incidents-line-clamp-2">
            {incident.spec.summary}
          </p>
        )}

        {incident.spec.labels && incident.spec.labels.length > 0 && (
          <div className="incidents-flex incidents-flex-wrap incidents-gap-1 incidents-mt-2">
            {incident.spec.labels.slice(0, 3).map((label) => (
              <Badge
                key={`${label.key}:${label.value}`}
                variant="outline"
                className="incidents-text-xs"
              >
                {label.key}: {label.value}
              </Badge>
            ))}
            {incident.spec.labels.length > 3 && (
              <Badge variant="outline" className="incidents-text-xs">
                +{incident.spec.labels.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
