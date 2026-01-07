/**
 * Card Component
 * 
 * A standardized card component with multiple variants and padding options.
 */

import { forwardRef } from 'react';
import { cardVariants } from './Card.styles';
import { cn } from '../../utilities';
import { CardProps } from './Card.types';

/**
 * Card component with multiple variants and padding options.
 * 
 * @example
 * ```tsx
 * <Card variant="elevated" padding="lg">
 *   <h2>Card Title</h2>
 *   <p>Card content</p>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hover = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, hover }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

