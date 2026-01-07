/**
 * Light Theme Configuration
 * 
 * Defines the light theme configuration using design tokens.
 */

import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing } from '../tokens/spacing';
import { shadows } from '../tokens/shadows';
import { borders } from '../tokens/borders';
import { transitions } from '../tokens/transitions';

export const lightTheme = {
  name: 'light',
  colors: {
    primary: colors.primary,
    secondary: colors.secondary,
    semantic: colors.semantic,
    neutral: colors.neutral,
    background: colors.functional.background.light,
    backgroundSecondary: '#f9fafb',
    text: {
      primary: colors.functional.text.primary.light,
      secondary: colors.functional.text.secondary.light,
      muted: colors.functional.text.muted.light,
    },
    border: colors.functional.border.light,
  },
  typography: typography,
  spacing: spacing,
  shadows: shadows,
  borders: borders,
  transitions: transitions,
} as const;

