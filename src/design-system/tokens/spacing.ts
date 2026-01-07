/**
 * Spacing Design Tokens
 * 
 * Centralized spacing system for the application.
 * Provides spacing scale and semantic spacing values.
 */

export const spacing = {
  // Scale de spațiere (0-96)
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  
  // Spațiere semantică
  semantic: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  // Padding componente
  component: {
    button: {
      sm: '0.5rem 1rem',      // py-2 px-4
      md: '0.625rem 1.25rem', // py-2.5 px-5
      lg: '0.75rem 1.5rem',   // py-3 px-6
    },
    input: {
      sm: '0.5rem 0.75rem',   // py-2 px-3
      md: '0.625rem 1rem',    // py-2.5 px-4
      lg: '0.75rem 1.25rem',  // py-3 px-5
    },
    card: {
      sm: '1rem',             // p-4
      md: '1.5rem',           // p-6
      lg: '2rem',             // p-8
    },
  },
} as const;

