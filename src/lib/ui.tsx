import * as React from 'react';
import { cn, variants } from './ui-utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import type { JSX } from 'react';
import type { HTMLDivElement } from 'react';

const buttonVariants = cva(variants.button.base, {
  variants: variants.button.variants,
  defaultVariants: variants.button.defaultVariants,
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : 'button';
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

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}
      {...props}
    />
  )
);
Container.displayName = 'Container';

export { Button, Card, Container, buttonVariants };

// Animated section component
export const AnimatedSection = ({
  children,
  className,
  delay = 0,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated text component
export const AnimatedText = ({
  text,
  children,
  className,
  delay = 0,
  as: Component = 'div',
  ...props
}: {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
}) => {
  const content = text || children;
  if (!content) return null;

  const words = typeof content === 'string' ? content.split(' ') : [content];

  return (
    <Component className={cn('flex flex-wrap', className)} {...props}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + index * 0.1 }}
          className={typeof word === 'string' ? 'mr-2' : ''}
        >
          {word}
        </motion.span>
      ))}
    </Component>
  );
};
