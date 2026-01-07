/**
 * Design Tokens
 * 
 * Centralized design constants for the application.
 * Per @interface.md specifications, all hardcoded values should be moved here.
 * 
 * This file provides a single source of truth for:
 * - File upload configuration
 * - API configuration
 * - UI constants
 * - Accessibility settings
 * - Design tokens (colors, typography, spacing, etc.)
 * 
 * Usage:
 *   import { FILE_UPLOAD_CONFIG, API_CONFIG } from '../design-system/tokens';
 *   import { colors, typography } from '../design-system/tokens';
 */

// File Upload Configuration
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 16 * 1024 * 1024, // 16MB
  ALLOWED_TYPES: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'] as const,
  ALLOWED_EXTENSIONS: ['.pdf', '.png', '.jpg', '.jpeg'] as const,
} as const;

// API Configuration
export const API_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // milliseconds
  REQUEST_TIMEOUT: 30000, // 30 seconds
} as const;

// UI Constants
export const UI_CONFIG = {
  SKELETON_ANIMATION_DURATION: 1500, // milliseconds
  TOAST_DURATION: 5000, // milliseconds
  DEBOUNCE_DELAY: 300, // milliseconds
} as const;

// Accessibility
export const A11Y_CONFIG = {
  FOCUS_VISIBLE_CLASS: 'focus-visible',
  SKIP_LINK_TEXT: 'Skip to main content',
} as const;

// Re-export design tokens for convenience
export * from './tokens';

