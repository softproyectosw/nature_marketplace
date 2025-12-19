'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Input component with icon support
 * Matches the Eco-Luxury design from frontend-base/
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, error, type = 'text', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-olive-light pl-2">
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3',
            'focus-within:border-primary/50 focus-within:bg-white/10 transition-colors',
            error && 'border-red-500/50',
            className
          )}
        >
          {icon && (
            <span className="material-symbols-outlined text-wood-light mr-3">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className="bg-transparent border-none text-white placeholder:text-white/30 focus:ring-0 focus:outline-none w-full p-0"
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-400 text-xs pl-2">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
