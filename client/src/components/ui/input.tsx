import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'underline';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'w-full bg-transparent font-body text-sm text-[#1f1b18] outline-none placeholder:text-[#9e8e82]',
          variant === 'default' &&
            'rounded-lg border border-[#e8dfd6] bg-white px-4 py-3 transition-colors focus:border-[#c5a67c]',
          variant === 'underline' &&
            'border-b border-[#d9cfc6] px-0 py-2.5 focus:border-[#c5a67c]',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
