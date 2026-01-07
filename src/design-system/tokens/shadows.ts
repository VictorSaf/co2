/**
 * Shadow Design Tokens
 * 
 * Centralized shadow system for the application.
 * Provides standard shadows, dark mode shadows, and colored shadows.
 */

export const shadows = {
  // Umbre standard
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  
  // Umbre dark mode
  dark: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
    'gray-900/50': '0 4px 6px -1px rgba(17, 24, 39, 0.5)',
    'gray-900/70': '0 10px 15px -3px rgba(17, 24, 39, 0.7)',
  },
  
  // Umbre colorate (pentru focus, hover)
  colored: {
    primary: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    secondary: '0 0 0 3px rgba(20, 184, 166, 0.1)',
    success: '0 0 0 3px rgba(16, 185, 129, 0.1)',
    error: '0 0 0 3px rgba(239, 68, 68, 0.1)',
  },
} as const;

