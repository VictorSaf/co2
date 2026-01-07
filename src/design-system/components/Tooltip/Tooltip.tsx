/**
 * Tooltip Component
 * 
 * Refactored tooltip component using design system tokens.
 * Features:
 * - Keyboard accessible (focusable with Tab)
 * - Screen reader friendly (ARIA labels)
 * - Responsive positioning (prevents overflow on small screens)
 * - Smooth transitions
 * - Uses design system tokens instead of hardcoded values
 */

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utilities';
import { TooltipProps } from './Tooltip.types';

/**
 * Tooltip component with accessibility support and design system integration.
 * 
 * @example
 * ```tsx
 * <Tooltip text="Help text" ariaLabel="Help information" position="top" />
 * ```
 */
export function Tooltip({
  text,
  ariaLabel,
  position = 'top',
  variant = 'default',
  iconClassName,
}: TooltipProps) {
  return (
    <div className="tooltip-wrapper group mb-2">
      <InformationCircleIcon
        className={cn('tooltip-icon', `tooltip-${variant}`, iconClassName)}
        tabIndex={0}
        aria-label={ariaLabel}
        role="button"
      />
      <div
        className={cn(
          'tooltip-content',
          `tooltip-${position}`,
          `tooltip-${variant}`,
          'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
          'max-w-[calc(100vw-2rem)] sm:max-w-none sm:whitespace-nowrap break-words sm:break-normal'
        )}
      >
        {text}
      </div>
    </div>
  );
}

