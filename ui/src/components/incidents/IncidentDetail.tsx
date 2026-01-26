import React from 'react';
import { useIncident, useUpdateIncident, useDeleteIncident } from '@/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SeverityBadge } from '@/components/severity/SeverityBadge';
import { Timeline } from '@/components/timeline/Timeline';
import { TaskList } from '@/components/tasks/TaskList';
import { useSeverity } from '@/api/queries';
import { formatTimestamp, formatRelativeTime, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Tag,
  Trash2,
  Users,
} from 'lucide-react';

export interface IncidentDetailProps {
  /** Name of the incident to display */
  incidentName: string;
  /** Callback when incident is deleted */
  onDeleted?: () => void;
  /** Callback to navigate back to list */
  onBack?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Detailed view of a single incident with timeline and tasks.
 */
export function IncidentDetail({
  incidentName,
  onDeleted,
  onBack,
  className,
}: IncidentDetailProps) {
  const { data: incident, isLoading, error } = useIncident(incidentName);
  const { data: severity } = useSeverity(incident?.spec.severityRef || '');
  const updateIncident = useUpdateIncident();
  const deleteIncident = useDeleteIncident();

  const [activeTab, setActiveTab] = React.useState('timeline');

  const handleResolve = async () => {
    if (!incident) return;
    try {
      await updateIncident.mutateAsync({
        name: incidentName,
        incident: {
          ...incident,
          status: {
            ...incident.status,
            phase: 'resolved',
            closedTime: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Failed to resolve incident:', error);
    }
  };

  const handleReopen = async () => {
    if (!incident) return;
    try {
      await updateIncident.mutateAsync({
        name: incidentName,
        incident: {
          ...incident,
          status: {
            ...incident.status,
            phase: 'active',
            closedTime: undefined,
          },
        },
      });
    } catch (error) {
      console.error('Failed to reopen incident:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this incident?')) return;
    try {
      await deleteIncident.mutateAsync(incidentName);
      onDeleted?.();
    } catch (error) {
      console.error('Failed to delete incident:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('incidents-animate-pulse incidents-space-y-4', className)}>
        <div className="incidents-h-8 incidents-bg-muted incidents-rounded incidents-w-2/3" />
        <div className="incidents-h-4 incidents-bg-muted incidents-rounded incidents-w-1/3" />
        <div className="incidents-h-32 incidents-bg-muted incidents-rounded" />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <Card className={cn('incidents-border-destructive', className)}>
        <CardContent className="incidents-p-4">
          <p className="incidents-text-destructive incidents-text-sm">
            Failed to load incident: {(error as Error)?.message || 'Incident not found'}
          </p>
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack} className="incidents-mt-2">
              Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const phase = incident.status?.phase || 'active';
  const isActive = phase === 'active';

  return (
    <div className={cn('incidents-space-y-6', className)}>
      {/* Header */}
      <div className="incidents-space-y-4">
        <div className="incidents-flex incidents-items-start incidents-justify-between">
          <div className="incidents-space-y-1">
            <h1 className="incidents-text-2xl incidents-font-bold">{incident.spec.title}</h1>
            <p className="incidents-text-sm incidents-text-muted-foreground">
              {incident.metadata.name}
            </p>
          </div>
          <div className="incidents-flex incidents-items-center incidents-gap-2">
            {incident.spec.isDrill && (
              <Badge variant="drill">Drill</Badge>
            )}
            <Badge variant={isActive ? 'active' : 'resolved'} className="incidents-text-sm">
              {phase}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="incidents-flex incidents-items-center incidents-gap-2">
          {isActive ? (
            <Button
              onClick={handleResolve}
              disabled={updateIncident.isPending}
              className="incidents-bg-status-resolved hover:incidents-bg-status-resolved/90"
            >
              <CheckCircle className="incidents-h-4 incidents-w-4 incidents-mr-2" />
              Resolve Incident
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleReopen}
              disabled={updateIncident.isPending}
            >
              <AlertCircle className="incidents-h-4 incidents-w-4 incidents-mr-2" />
              Reopen Incident
            </Button>
          )}
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={deleteIncident.isPending}
          >
            <Trash2 className="incidents-h-4 incidents-w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Info Grid */}
      <div className="incidents-grid incidents-grid-cols-2 md:incidents-grid-cols-4 incidents-gap-4">
        {/* Severity */}
        <Card>
          <CardContent className="incidents-p-4">
            <div className="incidents-flex incidents-items-center incidents-gap-2 incidents-text-sm incidents-text-muted-foreground incidents-mb-1">
              <AlertCircle className="incidents-h-4 incidents-w-4" />
              Severity
            </div>
            {severity ? (
              <SeverityBadge severity={severity} />
            ) : (
              <span className="incidents-text-muted-foreground">Not set</span>
            )}
          </CardContent>
        </Card>

        {/* Created */}
        <Card>
          <CardContent className="incidents-p-4">
            <div className="incidents-flex incidents-items-center incidents-gap-2 incidents-text-sm incidents-text-muted-foreground incidents-mb-1">
              <Calendar className="incidents-h-4 incidents-w-4" />
              Created
            </div>
            <div className="incidents-font-medium">
              {formatRelativeTime(incident.status?.createdTime)}
            </div>
            <div className="incidents-text-xs incidents-text-muted-foreground">
              {formatTimestamp(incident.status?.createdTime)}
            </div>
          </CardContent>
        </Card>

        {/* Duration */}
        <Card>
          <CardContent className="incidents-p-4">
            <div className="incidents-flex incidents-items-center incidents-gap-2 incidents-text-sm incidents-text-muted-foreground incidents-mb-1">
              <Clock className="incidents-h-4 incidents-w-4" />
              {isActive ? 'Duration' : 'Resolved'}
            </div>
            <div className="incidents-font-medium">
              {isActive
                ? formatRelativeTime(incident.status?.createdTime)
                : formatRelativeTime(incident.status?.closedTime)}
            </div>
          </CardContent>
        </Card>

        {/* Assigned */}
        <Card>
          <CardContent className="incidents-p-4">
            <div className="incidents-flex incidents-items-center incidents-gap-2 incidents-text-sm incidents-text-muted-foreground incidents-mb-1">
              <Users className="incidents-h-4 incidents-w-4" />
              Assigned
            </div>
            <div className="incidents-font-medium">
              {incident.spec.roles?.length || 0} people
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {incident.spec.summary && (
        <Card>
          <CardHeader className="incidents-pb-2">
            <CardTitle className="incidents-text-sm">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="incidents-text-sm">{incident.spec.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Labels */}
      {incident.spec.labels && incident.spec.labels.length > 0 && (
        <Card>
          <CardHeader className="incidents-pb-2">
            <CardTitle className="incidents-text-sm incidents-flex incidents-items-center incidents-gap-2">
              <Tag className="incidents-h-4 incidents-w-4" />
              Labels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="incidents-flex incidents-flex-wrap incidents-gap-2">
              {incident.spec.labels.map((label) => (
                <Badge key={`${label.key}:${label.value}`} variant="outline">
                  {label.key}: {label.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roles */}
      {incident.spec.roles && incident.spec.roles.length > 0 && (
        <Card>
          <CardHeader className="incidents-pb-2">
            <CardTitle className="incidents-text-sm incidents-flex incidents-items-center incidents-gap-2">
              <Users className="incidents-h-4 incidents-w-4" />
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="incidents-space-y-2">
              {incident.spec.roles.map((role, index) => (
                <div
                  key={index}
                  className="incidents-flex incidents-items-center incidents-gap-3"
                >
                  <Avatar className="incidents-h-8 incidents-w-8">
                    <AvatarFallback>{getInitials(role.userID)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="incidents-font-medium incidents-capitalize">{role.role}</div>
                    <div className="incidents-text-xs incidents-text-muted-foreground">
                      {role.userID}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Timeline and Tasks */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline">
          <Timeline incidentName={incidentName} />
        </TabsContent>
        <TabsContent value="tasks">
          <TaskList incidentName={incidentName} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
