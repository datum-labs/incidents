import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'incidents-inline-flex incidents-h-10 incidents-items-center incidents-justify-center incidents-rounded-md incidents-bg-muted incidents-p-1 incidents-text-muted-foreground',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'incidents-inline-flex incidents-items-center incidents-justify-center incidents-whitespace-nowrap incidents-rounded-sm incidents-px-3 incidents-py-1.5 incidents-text-sm incidents-font-medium incidents-ring-offset-background incidents-transition-all focus-visible:incidents-outline-none focus-visible:incidents-ring-2 focus-visible:incidents-ring-ring focus-visible:incidents-ring-offset-2 disabled:incidents-pointer-events-none disabled:incidents-opacity-50 data-[state=active]:incidents-bg-background data-[state=active]:incidents-text-foreground data-[state=active]:incidents-shadow-sm',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'incidents-mt-2 incidents-ring-offset-background focus-visible:incidents-outline-none focus-visible:incidents-ring-2 focus-visible:incidents-ring-ring focus-visible:incidents-ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
