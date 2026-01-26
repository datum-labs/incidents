import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateTask } from '@/api/queries';
import { toResourceName } from '@/lib/utils';
import { Plus } from 'lucide-react';

export interface TaskFormProps {
  /** Name of the incident to add the task to */
  incidentName: string;
  /** Callback when task is successfully created */
  onCreated?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Form for adding a new task to an incident.
 */
export function TaskForm({ incidentName, onCreated, className }: TaskFormProps) {
  const [text, setText] = React.useState('');
  const [assignee, setAssignee] = React.useState('');
  const createTask = useCreateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      // Generate a unique name for the task
      const timestamp = Date.now();
      const taskName = toResourceName(`${incidentName}-task-${timestamp}`);

      await createTask.mutateAsync({
        metadata: {
          name: taskName,
        },
        spec: {
          incidentName,
          text: text.trim(),
          assigneeUserID: assignee.trim() || undefined,
        },
      });

      setText('');
      setAssignee('');
      onCreated?.();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="incidents-p-4">
        <form onSubmit={handleSubmit} className="incidents-space-y-3">
          <div className="incidents-flex incidents-gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a new task..."
              className="incidents-flex-1"
            />
            <Input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Assignee (optional)"
              className="incidents-w-[200px]"
            />
            <Button
              type="submit"
              disabled={!text.trim() || createTask.isPending}
              size="icon"
            >
              <Plus className="incidents-h-4 incidents-w-4" />
            </Button>
          </div>

          {createTask.isError && (
            <p className="incidents-text-sm incidents-text-destructive">
              Failed to add task: {(createTask.error as Error).message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
