/**
 * Color Design Tokens
 * 
 * Centralized color system for the application.
 * Provides primary, secondary, semantic, neutral, and functional colors.
 */

export const colors = {
  // Culori primare (brand)
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',  // Primary principal
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  
  // Culori secundare (accent)
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',  // Secondary principal (teal)
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },
  
  // Culori semantice
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
  
  // Culori neutre (gray scale)
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
  
  // Culori funcționale (background, text, border)
  functional: {
    background: {
      light: '#ffffff',
      dark: '#12121a',      // Dark void (din Login)
      darker: '#0a0a0f',    // Dark matter
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
} as const;

