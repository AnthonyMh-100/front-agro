import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-[2px] px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/80',
        secondary: 'bg-surface text-foreground hover:bg-surface/70',
        outline: 'border border-border bg-background hover:bg-muted',
        ghost: 'hover:bg-muted',
      },
      size: {
        default: 'min-h-[44px] px-3 py-1.5',
        sm: 'min-h-[44px] px-2 text-xs',
        lg: 'min-h-[44px] px-4',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
