/**
 * Input Component Types
 * 
 * TypeScript types and interfaces for the Input component.
 */

import { InputHTMLAttributes } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'dark';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  size?: InputSize;
  variant?: InputVariant;
}

