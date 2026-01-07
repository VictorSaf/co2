/**
 * Transition Design Tokens
 * 
 * Centralized transition and animation system for the application.
 * Provides durations, timing functions, and preset transitions.
 */

export const transitions = {
  // Durate
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  
  // Timing functions
  timing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Tranziții predefinite
  preset: {
    default: 'all 200ms ease-in-out',
    colors: 'color 200ms ease-in-out, background-color 200ms ease-in-out, border-color 200ms ease-in-out',
    opacity: 'opacity 200ms ease-in-out',
    transform: 'transform 200ms ease-in-out',
    shadow: 'box-shadow 200ms ease-in-out',
  },
} as const;

