/**
 * Design System Theme - Portable TypeScript Export
 * 
 * Complete design system theme tokens for CO2 Trading Platform.
 * This file can be imported and used in any TypeScript/JavaScript application.
 * 
 * @version 1.0.0
 * 
 * @example
 * ```typescript
 * import { theme, THEME_VERSION } from './design-system-theme';
 * 
 * // Access theme values
 * const primaryColor = theme.colors.primary[600]; // '#4f46e5'
 * const padding = theme.spacing[4]; // '1rem'
 * 
 * // Check version
 * console.log(THEME_VERSION); // '1.0.0'
 * ```
 * 
 * @see DESIGN_SYSTEM_THEME_README.md for complete usage documentation
 * @see design-system-theme.json for JSON format
 * @see design-system-theme.schema.json for JSON Schema validation
 */

export const THEME_VERSION = '1.0.0';

export const theme = {
  colors: {
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
    },
    secondary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
      950: '#042f2e',
    },
    semantic: {
      success: {
        light: '#10b981',
        DEFAULT: '#059669',
        dark: '#047857',
      },
      error: {
        light: '#ef4444',
        DEFAULT: '#dc2626',
        dark: '#b91c1c',
      },
      warning: {
        light: '#f59e0b',
        DEFAULT: '#d97706',
        dark: '#b45309',
      },
      info: {
        light: '#3b82f6',
        DEFAULT: '#2563eb',
        dark: '#1d4ed8',
      },
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    functional: {
      background: {
        light: '#ffffff',
        dark: '#12121a',
        darker: '#0a0a0f',
      },
      text: {
        primary: {
          light: '#111827',
          dark: '#f9fafb',
        },
        secondary: {
          light: '#6b7280',
          dark: '#9ca3af',
        },
        muted: {
          light: '#9ca3af',
          dark: 'rgba(255,255,255,0.4)',
        },
      },
      border: {
        light: '#e5e7eb',
        dark: 'rgba(255,255,255,0.12)',
      },
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
      sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
      base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0em' }],
      lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
      xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
      '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.05em' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.05em' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.05em' }],
      '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
      label: ['0.7rem', { lineHeight: '1rem', letterSpacing: '0.2em' }],
      display: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.1em' }],
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
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
  },
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    semantic: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    component: {
      button: {
        sm: '0.5rem 1rem',
        md: '0.625rem 1.25rem',
        lg: '0.75rem 1.5rem',
      },
      input: {
        sm: '0.5rem 0.75rem',
        md: '0.625rem 1rem',
        lg: '0.75rem 1.25rem',
      },
      card: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    dark: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
      'gray-900/50': '0 4px 6px -1px rgba(17, 24, 39, 0.5)',
      'gray-900/70': '0 10px 15px -3px rgba(17, 24, 39, 0.7)',
    },
    colored: {
      primary: '0 0 0 3px rgba(79, 70, 229, 0.1)',
      secondary: '0 0 0 3px rgba(20, 184, 166, 0.1)',
      success: '0 0 0 3px rgba(16, 185, 129, 0.1)',
      error: '0 0 0 3px rgba(239, 68, 68, 0.1)',
    },
  },
  borders: {
    radius: {
      none: '0',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
    width: {
      0: '0',
      1: '1px',
      2: '2px',
      4: '4px',
      8: '8px',
    },
    style: {
      solid: 'solid',
      dashed: 'dashed',
      dotted: 'dotted',
      none: 'none',
    },
    color: {
      light: '#e5e7eb',
      dark: 'rgba(255,255,255,0.12)',
      primary: '#4f46e5',
      secondary: '#14b8a6',
    },
  },
  transitions: {
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
    timing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    preset: {
      default: 'all 200ms ease-in-out',
      colors: 'color 200ms ease-in-out, background-color 200ms ease-in-out, border-color 200ms ease-in-out',
      opacity: 'opacity 200ms ease-in-out',
      transform: 'transform 200ms ease-in-out',
      shadow: 'box-shadow 200ms ease-in-out',
    },
  },
  breakpoints: {
    mobile: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    semantic: {
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modalBackdrop: 1040,
      modal: 1050,
      popover: 1060,
      tooltip: 1070,
      notification: 1080,
    },
  },
  themes: {
    light: {
      background: '#ffffff',
      backgroundSecondary: '#f9fafb',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      border: '#e5e7eb',
    },
    dark: {
      background: '#12121a',
      backgroundSecondary: '#0a0a0f',
      textPrimary: '#f9fafb',
      textSecondary: 'rgba(255,255,255,0.4)',
      textMuted: 'rgba(255,255,255,0.4)',
      border: 'rgba(255,255,255,0.12)',
    },
  },
} as const;

// Type exports for TypeScript usage
export type Theme = typeof theme;
export type ColorScale = typeof theme.colors.primary;
export type SemanticColors = typeof theme.colors.semantic;
export type FunctionalColors = typeof theme.colors.functional;
export type Typography = typeof theme.typography;
export type FontFamily = typeof theme.typography.fontFamily;
export type FontSize = typeof theme.typography.fontSize;
export type FontWeight = typeof theme.typography.fontWeight;
export type TextStyle = typeof theme.typography.textStyle;
export type Spacing = typeof theme.spacing;
export type SpacingScale = typeof theme.spacing;
export type SpacingSemantic = typeof theme.spacing.semantic;
export type SpacingComponent = typeof theme.spacing.component;
export type Shadows = typeof theme.shadows;
export type ShadowStandard = typeof theme.shadows;
export type ShadowDark = typeof theme.shadows.dark;
export type ShadowColored = typeof theme.shadows.colored;
export type Borders = typeof theme.borders;
export type BorderRadius = typeof theme.borders.radius;
export type BorderWidth = typeof theme.borders.width;
export type BorderStyle = typeof theme.borders.style;
export type BorderColor = typeof theme.borders.color;
export type Transitions = typeof theme.transitions;
export type TransitionDuration = typeof theme.transitions.duration;
export type TransitionTiming = typeof theme.transitions.timing;
export type TransitionPreset = typeof theme.transitions.preset;
export type Breakpoints = typeof theme.breakpoints;
export type ZIndex = typeof theme.zIndex;
export type ZIndexScale = typeof theme.zIndex;
export type ZIndexSemantic = typeof theme.zIndex.semantic;
export type ThemeLight = typeof theme.themes.light;
export type ThemeDark = typeof theme.themes.dark;

