/**
 * Input Component Styles
 * 
 * Style definitions for the Input component using class-variance-authority.
 */

import { cva, type VariantProps } from 'class-variance-authority';

export const inputVariants = cva(
  // Base classes
  'block w-full rounded-md border shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'border-border dark:border-neutral-600 bg-background dark:bg-neutral-800 text-text-primary dark:text-text-primary-dark focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400',
        dark: 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.85)] text-sm tracking-[0.05em] focus:outline-none focus:border-secondary-500 focus:bg-[rgba(255,255,255,0.06)] placeholder:text-text-muted-dark placeholder:text-label placeholder:uppercase placeholder:tracking-[0.2em]',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-5 py-3 text-lg',
      },
      error: {
        true: 'border-semantic-error dark:border-semantic-error-light focus:border-semantic-error dark:focus:border-semantic-error-light focus:ring-semantic-error dark:focus:ring-semantic-error-light',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      error: false,
    },
  }
);

export type InputVariants = VariantProps<typeof inputVariants>;

