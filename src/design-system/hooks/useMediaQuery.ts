/**
 * useMediaQuery Hook
 * 
 * Hook for responsive behavior using media queries.
 * Returns boolean indicating if the media query matches.
 */

import { useState, useEffect } from 'react';
import { breakpoints } from '../tokens/breakpoints';

/**
 * Hook to check if a media query matches
 * 
 * @param query - Media query string (e.g., '(min-width: 768px)')
 * @returns Boolean indicating if the media query matches
 * 
 * @example
 * ```tsx
 * const isMobile = useMediaQuery(`(max-width: ${breakpoints.md})`);
 * const isDesktop = useMediaQuery(`(min-width: ${breakpoints.lg})`);
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create handler
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

/**
 * Hook to check if screen is at or above a breakpoint
 * 
 * @param breakpoint - Breakpoint key (e.g., 'md', 'lg')
 * @returns Boolean indicating if screen is at or above breakpoint
 * 
 * @example
 * ```tsx
 * const isTabletOrAbove = useBreakpoint('md');
 * const isDesktop = useBreakpoint('lg');
 * ```
 */
export function useBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
  const breakpointValue = breakpoints[breakpoint];
  return useMediaQuery(`(min-width: ${breakpointValue})`);
}

