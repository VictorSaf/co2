/**
 * Form Field Component
 * 
 * A wrapper component for form fields with label, error, and helper text support.
 */

import { HTMLAttributes } from 'react';
import { cn } from '../../utilities';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

/**
 * FormField component that wraps form inputs with label, error, and helper text.
 * 
 * @example
 * ```tsx
 * <FormField label="Email" required error="Email is required">
 *   <Input type="email" />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  required,
  error,
  helperText,
  children,
  className,
  ...props
}: FormFieldProps) {
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn('form-field', className)} {...props}>
      {label && (
        <label htmlFor={fieldId} className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      <div id={fieldId}>
        {children}
      </div>
      {error && <span className="form-error" role="alert">{error}</span>}
      {helperText && !error && <span className="form-helper">{helperText}</span>}
    </div>
  );
}

