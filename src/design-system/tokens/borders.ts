/**
 * Border Design Tokens
 * 
 * Centralized border system for the application.
 * Provides border radius, width, style, and colors.
 */

export const borders = {
  // Border radius
  radius: {
    none: '0',
    sm: '0.125rem',    // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px',
  },
  
  // Border width
  width: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
  
  // Border style
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    none: 'none',
  },
  
  // Border colors (din colors.ts)
  color: {
    light: '#e5e7eb',
    dark: 'rgba(255,255,255,0.12)',
    primary: '#4f46e5',
    secondary: '#14b8a6',
  },
} as const;

