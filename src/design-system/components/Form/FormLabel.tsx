/**
 * Form Label Component
 * 
 * A standalone label component for form fields.
 */

import { LabelHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utilities';

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

/**
 * FormLabel component for form field labels.
 * 
 * @example
 * ```tsx
 * <FormLabel htmlFor="email" required>Email</FormLabel>
 * ```
 */
export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ required, className, children, ...props }, ref) => {
    return (
      <label ref={ref} className={cn('form-label', className)} {...props}>
        {children}
        {required && <span className="form-required">*</span>}
      </label>
    );
  }
);

FormLabel.displayName = 'FormLabel';

