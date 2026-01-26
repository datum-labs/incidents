import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'incidents-inline-flex incidents-items-center incidents-justify-center incidents-gap-2 incidents-whitespace-nowrap incidents-rounded-md incidents-text-sm incidents-font-medium incidents-ring-offset-background incidents-transition-colors focus-visible:incidents-outline-none focus-visible:incidents-ring-2 focus-visible:incidents-ring-ring focus-visible:incidents-ring-offset-2 disabled:incidents-pointer-events-none disabled:incidents-opacity-50 [&_svg]:incidents-pointer-events-none [&_svg]:incidents-size-4 [&_svg]:incidents-shrink-0',
  {
    variants: {
      variant: {
        default:
          'incidents-bg-primary incidents-text-primary-foreground hover:incidents-bg-primary/90',
        destructive:
          'incidents-bg-destructive incidents-text-destructive-foreground hover:incidents-bg-destructive/90',
        outline:
          'incidents-border incidents-border-input incidents-bg-background hover:incidents-bg-accent hover:incidents-text-accent-foreground',
        secondary:
          'incidents-bg-secondary incidents-text-secondary-foreground hover:incidents-bg-secondary/80',
        ghost: 'hover:incidents-bg-accent hover:incidents-text-accent-foreground',
        link: 'incidents-text-primary incidents-underline-offset-4 hover:incidents-underline',
      },
      size: {
        default: 'incidents-h-10 incidents-px-4 incidents-py-2',
        sm: 'incidents-h-9 incidents-rounded-md incidents-px-3',
        lg: 'incidents-h-11 incidents-rounded-md incidents-px-8',
        icon: 'incidents-h-10 incidents-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
