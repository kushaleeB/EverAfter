import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-body text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'rounded-[var(--radius-pill)] bg-primary-container px-8 py-3 text-on-primary-container shadow-ambient hover:bg-primary hover:text-on-primary',
        glass:
          'rounded-[var(--radius-pill)] border border-outline-variant bg-glass-bg px-6 py-2.5 text-on-surface backdrop-blur-md hover:bg-surface-container',
        ghost: 'rounded-[var(--radius-pill)] text-on-surface-variant hover:text-primary hover:bg-surface-container/60 px-4 py-2',
        link: 'text-on-surface-variant underline-offset-4 hover:text-primary hover:underline p-0 h-auto font-medium',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-10 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
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
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
