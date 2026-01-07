/**
 * Badge Component Styles
 * 
 * Style definitions for the Badge component using class-variance-authority.
 */

import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  // Base classes
  'inline-flex items-center rounded-full font-medium',
  {
    variants: {
      variant: {
        primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
        secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200',
        success: 'bg-semantic-success-light/20 text-semantic-success-dark dark:bg-semantic-success-dark/30 dark:text-semantic-success-light',
        error: 'bg-semantic-error-light/20 text-semantic-error-dark dark:bg-semantic-error-dark/30 dark:text-semantic-error-light',
        warning: 'bg-semantic-warning-light/20 text-semantic-warning-dark dark:bg-semantic-warning-dark/30 dark:text-semantic-warning-light',
        info: 'bg-semantic-info-light/20 text-semantic-info-dark dark:bg-semantic-info-dark/30 dark:text-semantic-info-light',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

