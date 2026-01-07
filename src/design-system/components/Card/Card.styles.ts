/**
 * Card Component Styles
 * 
 * Style definitions for the Card component using class-variance-authority.
 */

import { cva, type VariantProps } from 'class-variance-authority';

export const cardVariants = cva(
  // Base classes
  'bg-background dark:bg-background-dark rounded-lg shadow-md dark:shadow-gray-900/50',
  {
    variants: {
      variant: {
        default: 'border border-border dark:border-border-dark',
        elevated: 'shadow-lg',
        outlined: 'border-2 border-border dark:border-border-dark',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        true: 'transition-shadow hover:shadow-lg cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: false,
    },
  }
);

export type CardVariants = VariantProps<typeof cardVariants>;

