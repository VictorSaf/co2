/**
 * Badge Component
 * 
 * A standardized badge component for displaying labels, statuses, or counts.
 */

import { forwardRef } from 'react';
import { badgeVariants } from './Badge.styles';
import { cn } from '../../utilities';
import { BadgeProps } from './Badge.types';

/**
 * Badge component for displaying labels, statuses, or counts.
 * 
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error" dot>Error</Badge>
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      dot,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-2 h-2 rounded-full mr-1',
              variant === 'primary' && 'bg-primary-600 dark:bg-primary-400',
              variant === 'secondary' && 'bg-secondary-600 dark:bg-secondary-400',
              variant === 'success' && 'bg-semantic-success dark:bg-semantic-success-light',
              variant === 'error' && 'bg-semantic-error dark:bg-semantic-error-light',
              variant === 'warning' && 'bg-semantic-warning dark:bg-semantic-warning-light',
              variant === 'info' && 'bg-semantic-info dark:bg-semantic-info-light'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

