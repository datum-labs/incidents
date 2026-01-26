import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'incidents-flex incidents-min-h-[80px] incidents-w-full incidents-rounded-md incidents-border incidents-border-input incidents-bg-background incidents-px-3 incidents-py-2 incidents-text-sm incidents-ring-offset-background placeholder:incidents-text-muted-foreground focus-visible:incidents-outline-none focus-visible:incidents-ring-2 focus-visible:incidents-ring-ring focus-visible:incidents-ring-offset-2 disabled:incidents-cursor-not-allowed disabled:incidents-opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
