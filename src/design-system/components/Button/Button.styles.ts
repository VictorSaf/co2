/**
 * Button Component Styles
 * 
 * Style definitions for the Button component using class-variance-authority.
 */

import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  // Base classes
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
        outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20',
        ghost: 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20',
        danger: 'bg-error text-white hover:bg-semantic-error-dark focus:ring-semantic-error-light',
        success: 'bg-success text-white hover:bg-semantic-success-dark focus:ring-semantic-success-light',
        info: 'bg-info text-white hover:bg-semantic-info-dark focus:ring-semantic-info-light',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

