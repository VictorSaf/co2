/**
 * Breakpoint Design Tokens
 * 
 * Centralized breakpoint system for responsive design.
 * Provides standard and custom breakpoints.
 */

export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large desktop
  
  // Breakpoints custom (din aplicație)
  mobile: '480px',  // Mobile (din Login page)
} as const;

