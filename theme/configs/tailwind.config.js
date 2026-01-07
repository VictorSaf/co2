/**
 * Tailwind CSS Configuration Example
 * 
 * This is an example configuration for Tailwind CSS that uses tokens from the theme.
 * Copy this file to your project and adjust paths as needed.
 */

const theme = require('../tokens/theme.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        semantic: {
          success: theme.colors.semantic.success,
          error: theme.colors.semantic.error,
          warning: theme.colors.semantic.warning,
          info: theme.colors.semantic.info,
        },
        neutral: theme.colors.neutral,
        // Functional colors
        background: {
          DEFAULT: theme.colors.functional.background.light,
          secondary: theme.colors.functional.background.light,
          dark: theme.colors.functional.background.dark,
          darker: theme.colors.functional.background.darker,
        },
        text: {
          primary: {
            DEFAULT: theme.colors.functional.text.primary.light,
            dark: theme.colors.functional.text.primary.dark,
          },
          secondary: {
            DEFAULT: theme.colors.functional.text.secondary.light,
            dark: theme.colors.functional.text.secondary.dark,
          },
          muted: {
            DEFAULT: theme.colors.functional.text.muted.light,
            dark: theme.colors.functional.text.muted.dark,
          },
        },
        border: {
          DEFAULT: theme.colors.functional.border.light,
          dark: theme.colors.functional.border.dark,
        },
        // Alias for semantic colors
        success: theme.colors.semantic.success.DEFAULT,
        error: theme.colors.semantic.error.DEFAULT,
        warning: theme.colors.semantic.warning.DEFAULT,
        info: theme.colors.semantic.info.DEFAULT,
      },
      fontFamily: theme.typography.fontFamily,
      fontSize: Object.fromEntries(
        Object.entries(theme.typography.fontSize).map(([key, value]) => [
          key,
          [value.size, { lineHeight: value.lineHeight, letterSpacing: value.letterSpacing }]
        ])
      ),
      spacing: theme.spacing.scale,
      boxShadow: {
        ...theme.shadows.standard,
        'dark-sm': theme.shadows.dark.sm,
        'dark-md': theme.shadows.dark.md,
        'dark-lg': theme.shadows.dark.lg,
        'gray-900/50': theme.shadows.dark['gray-900/50'],
        'gray-900/70': theme.shadows.dark['gray-900/70'],
        'colored-primary': theme.shadows.colored.primary,
        'colored-secondary': theme.shadows.colored.secondary,
        'colored-success': theme.shadows.colored.success,
        'colored-error': theme.shadows.colored.error,
      },
      borderRadius: theme.borders.radius,
      borderWidth: theme.borders.width,
      transitionDuration: theme.transitions.duration,
      transitionTimingFunction: theme.transitions.timing,
      screens: theme.breakpoints,
      zIndex: {
        ...theme.zIndex.scale,
        dropdown: theme.zIndex.semantic.dropdown,
        sticky: theme.zIndex.semantic.sticky,
        fixed: theme.zIndex.semantic.fixed,
        modalBackdrop: theme.zIndex.semantic.modalBackdrop,
        modal: theme.zIndex.semantic.modal,
        popover: theme.zIndex.semantic.popover,
        tooltip: theme.zIndex.semantic.tooltip,
        notification: theme.zIndex.semantic.notification,
      },
    },
  },
  plugins: [],
};

