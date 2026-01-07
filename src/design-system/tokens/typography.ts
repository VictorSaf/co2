/**
 * Typography Design Tokens
 * 
 * Centralized typography system for the application.
 * Provides font families, sizes, weights, and text styles.
 */

export const typography = {
  // Familii de fonturi
  fontFamily: {
    sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
    mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
  },
  
  // Dimensiuni fonturi
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0em' }],        // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }], // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }], // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.05em' }],   // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.05em' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.05em' }], // 36px
    '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.05em' }],        // 48px
    
    // Dimensiuni speciale (din Login page)
    'label': ['0.7rem', { lineHeight: '1rem', letterSpacing: '0.2em' }],   // 11.2px uppercase
    'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.1em' }], // 56px
  },
  
  // Greutăți fonturi
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // Stiluri text
  textStyle: {
    uppercase: {
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
    },
    lowercase: {
      textTransform: 'lowercase',
    },
    capitalize: {
      textTransform: 'capitalize',
    },
  },
} as const;

