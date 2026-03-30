'use client';

import React from 'react';

import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2 focus:ring-offset-command-navy disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-forest-green text-white hover:bg-forest-green/90 focus:ring-forest-green/40',
      secondary:
        'bg-transparent text-white border border-slate-grey hover:border-forest-green hover:text-field-sage focus:ring-slate-grey/30',
      outline:
        'border-2 border-slate-grey text-white hover:border-forest-green hover:text-field-sage focus:ring-forest-green/30',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
