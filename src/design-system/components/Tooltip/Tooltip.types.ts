/**
 * Tooltip Component Types
 * 
 * TypeScript types and interfaces for the Tooltip component.
 */

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'default' | 'dark';

export interface TooltipProps {
  /** Tooltip text content */
  text: string;
  /** ARIA label for accessibility */
  ariaLabel: string;
  /** Tooltip position */
  position?: TooltipPosition;
  /** Tooltip variant */
  variant?: TooltipVariant;
  /** Optional custom className for the icon */
  iconClassName?: string;
}

