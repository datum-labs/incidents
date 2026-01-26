import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'incidents-inline-flex incidents-items-center incidents-rounded-full incidents-border incidents-px-2.5 incidents-py-0.5 incidents-text-xs incidents-font-semibold incidents-transition-colors focus:incidents-outline-none focus:incidents-ring-2 focus:incidents-ring-ring focus:incidents-ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'incidents-border-transparent incidents-bg-primary incidents-text-primary-foreground hover:incidents-bg-primary/80',
        secondary:
          'incidents-border-transparent incidents-bg-secondary incidents-text-secondary-foreground hover:incidents-bg-secondary/80',
        destructive:
          'incidents-border-transparent incidents-bg-destructive incidents-text-destructive-foreground hover:incidents-bg-destructive/80',
        outline: 'incidents-text-foreground',
        // Status variants
        active:
          'incidents-border-transparent incidents-bg-status-active incidents-text-white',
        resolved:
          'incidents-border-transparent incidents-bg-status-resolved incidents-text-white',
        drill:
          'incidents-border-transparent incidents-bg-status-drill incidents-text-white',
        // Task status variants
        todo:
          'incidents-border-transparent incidents-bg-task-todo incidents-text-white',
        progress:
          'incidents-border-transparent incidents-bg-task-progress incidents-text-white',
        done:
          'incidents-border-transparent incidents-bg-task-done incidents-text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
