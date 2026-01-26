import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, formatTimestamp } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { IncidentEvent } from '@/types/api';
import { MessageSquare, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export interface TimelineEntryProps {
  /** The event to display */
  event: IncidentEvent;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Single entry in the incident timeline.
 */
export function TimelineEntry({ event, className }: TimelineEntryProps) {
  const eventType = event.spec.eventType || 'note';
  const eventTime = event.spec.eventTime || event.metadata.creationTimestamp;

  const getEventIcon = () => {
    switch (eventType) {
      case 'status_change':
        return <RefreshCw className="incidents-h-4 incidents-w-4" />;
      case 'note':
      default:
        return <MessageSquare className="incidents-h-4 incidents-w-4" />;
    }
  };

  const getEventTypeLabel = () => {
    switch (eventType) {
      case 'status_change':
        return 'Status Change';
      case 'note':
      default:
        return 'Note';
    }
  };

  return (
    <div className={cn('incidents-flex incidents-gap-3', className)}>
      {/* Timeline indicator */}
      <div className="incidents-flex incidents-flex-col incidents-items-center">
        <div className="incidents-flex incidents-h-8 incidents-w-8 incidents-items-center incidents-justify-center incidents-rounded-full incidents-bg-muted incidents-text-muted-foreground">
          {getEventIcon()}
        </div>
        <div className="incidents-flex-1 incidents-w-px incidents-bg-border incidents-my-2" />
      </div>

      {/* Content */}
      <Card className="incidents-flex-1 incidents-mb-4">
        <CardContent className="incidents-p-4">
          <div className="incidents-flex incidents-items-start incidents-justify-between incidents-mb-2">
            <div className="incidents-flex incidents-items-center incidents-gap-2">
              <Badge variant="secondary" className="incidents-text-xs">
                {getEventTypeLabel()}
              </Badge>
              <span className="incidents-text-xs incidents-text-muted-foreground">
                {event.metadata.name}
              </span>
            </div>
            <div className="incidents-text-xs incidents-text-muted-foreground" title={formatTimestamp(eventTime)}>
              {formatRelativeTime(eventTime)}
            </div>
          </div>

          {/* Markdown content */}
          <div className="incidents-prose incidents-prose-sm incidents-max-w-none incidents-text-foreground">
            <ReactMarkdown
              components={{
                // Style markdown elements to match the design
                p: ({ children }) => (
                  <p className="incidents-mb-2 incidents-last:incidents-mb-0">{children}</p>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="incidents-text-primary incidents-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className="incidents-bg-muted incidents-px-1 incidents-py-0.5 incidents-rounded incidents-text-sm">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="incidents-bg-muted incidents-p-2 incidents-rounded incidents-overflow-x-auto incidents-text-sm">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => (
                  <ul className="incidents-list-disc incidents-list-inside incidents-mb-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="incidents-list-decimal incidents-list-inside incidents-mb-2">{children}</ol>
                ),
              }}
            >
              {event.spec.body}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
