import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'incidents-fixed incidents-inset-0 incidents-z-50 incidents-bg-black/80 data-[state=open]:incidents-animate-in data-[state=closed]:incidents-animate-out data-[state=closed]:incidents-fade-out-0 data-[state=open]:incidents-fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'incidents-fixed incidents-left-[50%] incidents-top-[50%] incidents-z-50 incidents-grid incidents-w-full incidents-max-w-lg incidents-translate-x-[-50%] incidents-translate-y-[-50%] incidents-gap-4 incidents-border incidents-bg-background incidents-p-6 incidents-shadow-lg incidents-duration-200 data-[state=open]:incidents-animate-in data-[state=closed]:incidents-animate-out data-[state=closed]:incidents-fade-out-0 data-[state=open]:incidents-fade-in-0 data-[state=closed]:incidents-zoom-out-95 data-[state=open]:incidents-zoom-in-95 data-[state=closed]:incidents-slide-out-to-left-1/2 data-[state=closed]:incidents-slide-out-to-top-[48%] data-[state=open]:incidents-slide-in-from-left-1/2 data-[state=open]:incidents-slide-in-from-top-[48%] sm:incidents-rounded-lg',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="incidents-absolute incidents-right-4 incidents-top-4 incidents-rounded-sm incidents-opacity-70 incidents-ring-offset-background incidents-transition-opacity hover:incidents-opacity-100 focus:incidents-outline-none focus:incidents-ring-2 focus:incidents-ring-ring focus:incidents-ring-offset-2 disabled:incidents-pointer-events-none data-[state=open]:incidents-bg-accent data-[state=open]:incidents-text-muted-foreground">
        <X className="incidents-h-4 incidents-w-4" />
        <span className="incidents-sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'incidents-flex incidents-flex-col incidents-space-y-1.5 incidents-text-center sm:incidents-text-left',
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'incidents-flex incidents-flex-col-reverse sm:incidents-flex-row sm:incidents-justify-end sm:incidents-space-x-2',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'incidents-text-lg incidents-font-semibold incidents-leading-none incidents-tracking-tight',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('incidents-text-sm incidents-text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
