/**
 * Class Names Utility
 * 
 * Utility function for combining CSS classes conditionally.
 * Uses clsx and tailwind-merge to handle Tailwind class conflicts.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names and merges Tailwind classes intelligently.
 * 
 * @param inputs - Class names or conditional class objects
 * @returns Merged class string
 * 
 * @example
 * ```tsx
 * cn('foo', 'bar') // 'foo bar'
 * cn('px-2 py-1', 'px-4') // 'py-1 px-4' (px-4 overrides px-2)
 * cn({ 'bg-red': isActive }) // 'bg-red' if isActive is true
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

