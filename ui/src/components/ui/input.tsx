import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'incidents-flex incidents-h-10 incidents-w-full incidents-rounded-md incidents-border incidents-border-input incidents-bg-background incidents-px-3 incidents-py-2 incidents-text-sm incidents-ring-offset-background file:incidents-border-0 file:incidents-bg-transparent file:incidents-text-sm file:incidents-font-medium file:incidents-text-foreground placeholder:incidents-text-muted-foreground focus-visible:incidents-outline-none focus-visible:incidents-ring-2 focus-visible:incidents-ring-ring focus-visible:incidents-ring-offset-2 disabled:incidents-cursor-not-allowed disabled:incidents-opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
