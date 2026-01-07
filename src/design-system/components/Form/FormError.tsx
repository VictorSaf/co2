/**
 * Form Error Component
 * 
 * A component for displaying form field errors.
 */

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utilities';

export interface FormErrorProps extends HTMLAttributes<HTMLSpanElement> {
  error: string;
}

/**
 * FormError component for displaying form field errors.
 * 
 * @example
 * ```tsx
 * <FormError error="This field is required" />
 * ```
 */
export const FormError = forwardRef<HTMLSpanElement, FormErrorProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('form-error', className)}
        role="alert"
        {...props}
      >
        {error}
      </span>
    );
  }
);

FormError.displayName = 'FormError';

