/**
 * Input Component
 * 
 * A standardized input component with label, error handling, and icon support.
 */

import { forwardRef } from 'react';
import { inputVariants } from './Input.styles';
import { cn } from '../../utilities';
import { InputProps } from './Input.types';

/**
 * Input component with label, error handling, and icon support.
 * 
 * @example
 * ```tsx
 * <Input label="Email" type="email" placeholder="Enter your email" />
 * <Input label="Password" type="password" error="Password is required" />
 * <Input leftIcon={<Icon />} helperText="Helper text" />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      size = 'md',
      variant = 'default',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="input-wrapper">
        {label && (
          <label htmlFor={inputId} className={cn(
            'input-label',
            variant === 'dark' && 'block text-label uppercase text-text-muted-dark mb-2'
          )}>
            {label}
          </label>
        )}
        <div className="input-container">
          {leftIcon && <span className="input-icon-left">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant, size, error: !!error }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              variant === 'dark' && 'p-4',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && <span className="input-icon-right">{rightIcon}</span>}
        </div>
        {error && (
          <span id={`${inputId}-error`} className="input-error-text" role="alert">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={`${inputId}-helper`} className="input-helper-text">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

