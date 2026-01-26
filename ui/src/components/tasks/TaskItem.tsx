import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUpdateTask, useDeleteTask } from '@/api/queries';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { IncidentTask } from '@/types/api';
import { Trash2, PlayCircle, CheckCircle } from 'lucide-react';

export interface TaskItemProps {
  /** The task to display */
  task: IncidentTask;
  /** Callback when task is updated */
  onUpdated?: () => void;
  /** Additional CSS classes */
  className?: string;
}

type TaskStatus = 'todo' | 'progress' | 'done';

/**
 * Single task item with status controls.
 */
export function TaskItem({ task, onUpdated, className }: TaskItemProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const status = (task.status?.status || 'todo') as TaskStatus;
  const isDone = status === 'done';

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateTask.mutateAsync({
        name: task.metadata.name,
        task: {
          ...task,
          status: {
            ...task.status,
            status: newStatus,
          },
        },
      });
      onUpdated?.();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask.mutateAsync(task.metadata.name);
      onUpdated?.();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getStatusBadgeVariant = (): 'todo' | 'progress' | 'done' => {
    return status;
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  return (
    <Card
      className={cn(
        'incidents-transition-colors',
        isDone && 'incidents-opacity-60',
        className
      )}
    >
      <CardContent className="incidents-p-4">
        <div className="incidents-flex incidents-items-start incidents-gap-3">
          {/* Checkbox for quick done toggle */}
          <Checkbox
            checked={isDone}
            onCheckedChange={(checked) =>
              handleStatusChange(checked ? 'done' : 'todo')
            }
            className="incidents-mt-1"
          />

          {/* Content */}
          <div className="incidents-flex-1 incidents-min-w-0">
            <p
              className={cn(
                'incidents-text-sm',
                isDone && 'incidents-line-through incidents-text-muted-foreground'
              )}
            >
              {task.spec.text}
            </p>

            <div className="incidents-flex incidents-items-center incidents-gap-2 incidents-mt-2">
              <Badge variant={getStatusBadgeVariant()} className="incidents-text-xs">
                {getStatusLabel()}
              </Badge>

              {task.spec.assigneeUserID && (
                <div className="incidents-flex incidents-items-center incidents-gap-1.5">
                  <Avatar className="incidents-h-5 incidents-w-5">
                    <AvatarFallback className="incidents-text-xs">
                      {getInitials(task.spec.assigneeUserID)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="incidents-text-xs incidents-text-muted-foreground">
                    {task.spec.assigneeUserID}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="incidents-flex incidents-items-center incidents-gap-1">
            {status === 'todo' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStatusChange('progress')}
                disabled={updateTask.isPending}
                title="Start task"
              >
                <PlayCircle className="incidents-h-4 incidents-w-4 incidents-text-task-progress" />
              </Button>
            )}
            {status === 'progress' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStatusChange('done')}
                disabled={updateTask.isPending}
                title="Complete task"
              >
                <CheckCircle className="incidents-h-4 incidents-w-4 incidents-text-task-done" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
              title="Delete task"
            >
              <Trash2 className="incidents-h-4 incidents-w-4 incidents-text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
