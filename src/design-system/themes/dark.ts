/**
 * Dark Theme Configuration
 * 
 * Defines the dark theme configuration using design tokens.
 */

import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing } from '../tokens/spacing';
import { shadows } from '../tokens/shadows';
import { borders } from '../tokens/borders';
import { transitions } from '../tokens/transitions';

export const darkTheme = {
  name: 'dark',
  colors: {
    primary: colors.primary,
    secondary: colors.secondary,
    semantic: colors.semantic,
    neutral: colors.neutral,
    background: colors.functional.background.dark,
    backgroundSecondary: colors.functional.background.darker,
    text: {
      primary: colors.functional.text.primary.dark,
      secondary: colors.functional.text.secondary.dark,
      muted: colors.functional.text.muted.dark,
    },
    border: colors.functional.border.dark,
  },
  typography: typography,
  spacing: spacing,
  shadows: shadows,
  borders: borders,
  transitions: transitions,
} as const;

