import React from 'react';
import { useTasksByIncident } from '@/api/queries';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

export interface TaskListProps {
  /** Name of the incident to show tasks for */
  incidentName: string;
  /** Whether to show the form to add new tasks */
  showForm?: boolean;
  /** Whether to group tasks by status */
  groupByStatus?: boolean;
  /** Additional CSS classes */
  className?: string;
}

type TaskStatus = 'todo' | 'progress' | 'done';

/**
 * Task list component showing all tasks for an incident.
 */
export function TaskList({
  incidentName,
  showForm = true,
  groupByStatus = true,
  className,
}: TaskListProps) {
  const { data: tasksData, isLoading, error, refetch, isFetching } = useTasksByIncident(incidentName);

  // Group tasks by status
  const groupedTasks = React.useMemo(() => {
    if (!tasksData?.items) return { todo: [], progress: [], done: [] };

    const groups: Record<TaskStatus, typeof tasksData.items> = {
      todo: [],
      progress: [],
      done: [],
    };

    tasksData.items.forEach((task) => {
      const status = (task.status?.status || 'todo') as TaskStatus;
      if (groups[status]) {
        groups[status].push(task);
      } else {
        groups.todo.push(task);
      }
    });

    return groups;
  }, [tasksData]);

  const allTasks = tasksData?.items || [];

  if (isLoading) {
    return (
      <div className={cn('incidents-space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="incidents-animate-pulse">
            <div className="incidents-h-16 incidents-bg-muted incidents-rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('incidents-p-4 incidents-border incidents-border-destructive incidents-rounded-md', className)}>
        <p className="incidents-text-destructive incidents-text-sm">
          Failed to load tasks: {(error as Error).message}
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
      {/* Add task form */}
      {showForm && (
        <TaskForm incidentName={incidentName} onCreated={() => refetch()} />
      )}

      {/* Stats and refresh */}
      <div className="incidents-flex incidents-items-center incidents-justify-between">
        <div className="incidents-flex incidents-items-center incidents-gap-2">
          <span className="incidents-text-sm incidents-text-muted-foreground">
            {allTasks.length} tasks
          </span>
          <Badge variant="todo" className="incidents-text-xs">
            {groupedTasks.todo.length} to do
          </Badge>
          <Badge variant="progress" className="incidents-text-xs">
            {groupedTasks.progress.length} in progress
          </Badge>
          <Badge variant="done" className="incidents-text-xs">
            {groupedTasks.done.length} done
          </Badge>
        </div>
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
      {allTasks.length === 0 && (
        <div className="incidents-text-center incidents-py-8">
          <p className="incidents-text-muted-foreground">
            No tasks yet. Add the first task above.
          </p>
        </div>
      )}

      {/* Grouped task lists */}
      {groupByStatus ? (
        <div className="incidents-space-y-6">
          {/* To Do */}
          {groupedTasks.todo.length > 0 && (
            <div className="incidents-space-y-2">
              <h3 className="incidents-text-sm incidents-font-medium incidents-flex incidents-items-center incidents-gap-2">
                <Badge variant="todo">To Do</Badge>
                <span className="incidents-text-muted-foreground">
                  ({groupedTasks.todo.length})
                </span>
              </h3>
              <div className="incidents-space-y-2">
                {groupedTasks.todo.map((task) => (
                  <TaskItem
                    key={task.metadata.name}
                    task={task}
                    onUpdated={() => refetch()}
                  />
                ))}
              </div>
            </div>
          )}

          {/* In Progress */}
          {groupedTasks.progress.length > 0 && (
            <div className="incidents-space-y-2">
              <h3 className="incidents-text-sm incidents-font-medium incidents-flex incidents-items-center incidents-gap-2">
                <Badge variant="progress">In Progress</Badge>
                <span className="incidents-text-muted-foreground">
                  ({groupedTasks.progress.length})
                </span>
              </h3>
              <div className="incidents-space-y-2">
                {groupedTasks.progress.map((task) => (
                  <TaskItem
                    key={task.metadata.name}
                    task={task}
                    onUpdated={() => refetch()}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Done */}
          {groupedTasks.done.length > 0 && (
            <div className="incidents-space-y-2">
              <h3 className="incidents-text-sm incidents-font-medium incidents-flex incidents-items-center incidents-gap-2">
                <Badge variant="done">Done</Badge>
                <span className="incidents-text-muted-foreground">
                  ({groupedTasks.done.length})
                </span>
              </h3>
              <div className="incidents-space-y-2">
                {groupedTasks.done.map((task) => (
                  <TaskItem
                    key={task.metadata.name}
                    task={task}
                    onUpdated={() => refetch()}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Flat task list */
        <div className="incidents-space-y-2">
          {allTasks.map((task) => (
            <TaskItem
              key={task.metadata.name}
              task={task}
              onUpdated={() => refetch()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
