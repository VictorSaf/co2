import { colors } from './src/design-system/tokens/colors';
import { typography } from './src/design-system/tokens/typography';
import { spacing } from './src/design-system/tokens/spacing';
import { shadows } from './src/design-system/tokens/shadows';
import { borders } from './src/design-system/tokens/borders';
import { transitions } from './src/design-system/tokens/transitions';
import { breakpoints } from './src/design-system/tokens/breakpoints';
import { zIndex } from './src/design-system/tokens/z-index';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        semantic: {
          success: colors.semantic.success,
          error: colors.semantic.error,
          warning: colors.semantic.warning,
          info: colors.semantic.info,
        },
        neutral: colors.neutral,
        // Mapare funcțională pentru utilizare în Tailwind
        background: {
          DEFAULT: colors.functional.background.light,
          secondary: '#f9fafb',
          dark: colors.functional.background.dark,
          darker: colors.functional.background.darker,
        },
        text: {
          primary: {
            DEFAULT: colors.functional.text.primary.light,
            dark: colors.functional.text.primary.dark,
          },
          secondary: {
            DEFAULT: colors.functional.text.secondary.light,
            dark: colors.functional.text.secondary.dark,
          },
          muted: {
            DEFAULT: colors.functional.text.muted.light,
            dark: colors.functional.text.muted.dark,
          },
        },
        border: {
          DEFAULT: colors.functional.border.light,
          dark: colors.functional.border.dark,
        },
        // Alias pentru semantic colors
        success: colors.semantic.success.DEFAULT,
        error: colors.semantic.error.DEFAULT,
        warning: colors.semantic.warning.DEFAULT,
        info: colors.semantic.info.DEFAULT,
      },
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      spacing: spacing,
      boxShadow: {
        ...shadows,
        'dark-sm': shadows.dark.sm,
        'dark-md': shadows.dark.md,
        'dark-lg': shadows.dark.lg,
        'gray-900/50': shadows.dark['gray-900/50'],
        'gray-900/70': shadows.dark['gray-900/70'],
        'colored-primary': shadows.colored.primary,
        'colored-secondary': shadows.colored.secondary,
        'colored-success': shadows.colored.success,
        'colored-error': shadows.colored.error,
      },
      borderRadius: borders.radius,
      borderWidth: borders.width,
      transitionDuration: transitions.duration,
      transitionTimingFunction: transitions.timing,
      screens: breakpoints,
      zIndex: {
        ...zIndex,
        dropdown: zIndex.semantic.dropdown,
        sticky: zIndex.semantic.sticky,
        fixed: zIndex.semantic.fixed,
        modalBackdrop: zIndex.semantic.modalBackdrop,
        modal: zIndex.semantic.modal,
        popover: zIndex.semantic.popover,
        tooltip: zIndex.semantic.tooltip,
        notification: zIndex.semantic.notification,
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}