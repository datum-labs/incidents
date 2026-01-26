import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'incidents-flex incidents-h-10 incidents-w-full incidents-items-center incidents-justify-between incidents-rounded-md incidents-border incidents-border-input incidents-bg-background incidents-px-3 incidents-py-2 incidents-text-sm incidents-ring-offset-background placeholder:incidents-text-muted-foreground focus:incidents-outline-none focus:incidents-ring-2 focus:incidents-ring-ring focus:incidents-ring-offset-2 disabled:incidents-cursor-not-allowed disabled:incidents-opacity-50 [&>span]:incidents-line-clamp-1',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="incidents-h-4 incidents-w-4 incidents-opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'incidents-flex incidents-cursor-default incidents-items-center incidents-justify-center incidents-py-1',
      className
    )}
    {...props}
  >
    <ChevronUp className="incidents-h-4 incidents-w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'incidents-flex incidents-cursor-default incidents-items-center incidents-justify-center incidents-py-1',
      className
    )}
    {...props}
  >
    <ChevronDown className="incidents-h-4 incidents-w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'incidents-relative incidents-z-50 incidents-max-h-96 incidents-min-w-[8rem] incidents-overflow-hidden incidents-rounded-md incidents-border incidents-bg-popover incidents-text-popover-foreground incidents-shadow-md data-[state=open]:incidents-animate-in data-[state=closed]:incidents-animate-out data-[state=closed]:incidents-fade-out-0 data-[state=open]:incidents-fade-in-0 data-[state=closed]:incidents-zoom-out-95 data-[state=open]:incidents-zoom-in-95 data-[side=bottom]:incidents-slide-in-from-top-2 data-[side=left]:incidents-slide-in-from-right-2 data-[side=right]:incidents-slide-in-from-left-2 data-[side=top]:incidents-slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:incidents-translate-y-1 data-[side=left]:incidents--translate-x-1 data-[side=right]:incidents-translate-x-1 data-[side=top]:incidents--translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'incidents-p-1',
          position === 'popper' &&
            'incidents-h-[var(--radix-select-trigger-height)] incidents-w-full incidents-min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('incidents-py-1.5 incidents-pl-8 incidents-pr-2 incidents-text-sm incidents-font-semibold', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'incidents-relative incidents-flex incidents-w-full incidents-cursor-default incidents-select-none incidents-items-center incidents-rounded-sm incidents-py-1.5 incidents-pl-8 incidents-pr-2 incidents-text-sm incidents-outline-none focus:incidents-bg-accent focus:incidents-text-accent-foreground data-[disabled]:incidents-pointer-events-none data-[disabled]:incidents-opacity-50',
      className
    )}
    {...props}
  >
    <span className="incidents-absolute incidents-left-2 incidents-flex incidents-h-3.5 incidents-w-3.5 incidents-items-center incidents-justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="incidents-h-4 incidents-w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('incidents--mx-1 incidents-my-1 incidents-h-px incidents-bg-muted', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
