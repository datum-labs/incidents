import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateEvent } from '@/api/queries';
import { toResourceName } from '@/lib/utils';
import { Send } from 'lucide-react';

export interface TimelineFormProps {
  /** Name of the incident to add the event to */
  incidentName: string;
  /** Callback when event is successfully created */
  onCreated?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Form for adding a new event to the incident timeline.
 */
export function TimelineForm({
  incidentName,
  onCreated,
  className,
}: TimelineFormProps) {
  const [body, setBody] = React.useState('');
  const [eventType, setEventType] = React.useState<string>('note');
  const createEvent = useCreateEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    try {
      // Generate a unique name for the event
      const timestamp = Date.now();
      const eventName = toResourceName(`${incidentName}-event-${timestamp}`);

      await createEvent.mutateAsync({
        metadata: {
          name: eventName,
        },
        spec: {
          incidentName,
          body: body.trim(),
          eventType,
          eventTime: new Date().toISOString(),
        },
      });

      setBody('');
      onCreated?.();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="incidents-p-4">
        <form onSubmit={handleSubmit} className="incidents-space-y-3">
          <div className="incidents-flex incidents-items-center incidents-gap-2">
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="incidents-w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="status_change">Status Change</SelectItem>
              </SelectContent>
            </Select>
            <span className="incidents-text-sm incidents-text-muted-foreground">
              Add a new entry to the timeline
            </span>
          </div>

          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your update here... (Markdown supported)"
            rows={3}
          />

          <div className="incidents-flex incidents-justify-between incidents-items-center">
            <span className="incidents-text-xs incidents-text-muted-foreground">
              Supports Markdown formatting
            </span>
            <Button
              type="submit"
              disabled={!body.trim() || createEvent.isPending}
              size="sm"
            >
              <Send className="incidents-h-4 incidents-w-4 incidents-mr-2" />
              {createEvent.isPending ? 'Posting...' : 'Post Update'}
            </Button>
          </div>

          {createEvent.isError && (
            <p className="incidents-text-sm incidents-text-destructive">
              Failed to post: {(createEvent.error as Error).message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
