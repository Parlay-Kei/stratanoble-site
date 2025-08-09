'use client';

import React from 'react';

import { cn } from '@strata-noble/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, as: Component = 'div', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn('container mx-auto px-4 sm:px-6 lg:px-8', className)}
      {...props}
    />
  )
);

Container.displayName = 'Container';
