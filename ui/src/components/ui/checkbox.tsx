import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'incidents-peer incidents-h-4 incidents-w-4 incidents-shrink-0 incidents-rounded-sm incidents-border incidents-border-primary incidents-ring-offset-background focus-visible:incidents-outline-none focus-visible:incidents-ring-2 focus-visible:incidents-ring-ring focus-visible:incidents-ring-offset-2 disabled:incidents-cursor-not-allowed disabled:incidents-opacity-50 data-[state=checked]:incidents-bg-primary data-[state=checked]:incidents-text-primary-foreground',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('incidents-flex incidents-items-center incidents-justify-center incidents-text-current')}
    >
      <Check className="incidents-h-4 incidents-w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
