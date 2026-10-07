import * as React from 'react';
import { cn } from '@/lib/utils';

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-11 w-full cursor-pointer rounded-[2px] border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-tertiary disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
