# API Reference

Complete reference for all design tokens available in the CO2 Trading Platform Design System Theme.

## Table of Contents

1. [Colors](#colors)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Shadows](#shadows)
5. [Borders](#borders)
6. [Transitions](#transitions)
7. [Breakpoints](#breakpoints)
8. [Z-Index](#z-index)
9. [Themes](#themes)
10. [TypeScript Types](#typescript-types)

## Colors

### Primary Colors

Indigo color scale for primary brand colors.

```typescript
theme.colors.primary[50]   // '#eef2ff' - Lightest
theme.colors.primary[100]  // '#e0e7ff'
theme.colors.primary[200]  // '#c7d2fe'
theme.colors.primary[300]  // '#a5b4fc'
theme.colors.primary[400]  // '#818cf8'
theme.colors.primary[500]  // '#6366f1'
theme.colors.primary[600]  // '#4f46e5' - Default primary
theme.colors.primary[700]  // '#4338ca'
theme.colors.primary[800]  // '#3730a3'
theme.colors.primary[900]  // '#312e81'
theme.colors.primary[950]  // '#1e1b4b' - Darkest
```

### Secondary Colors

Teal color scale for secondary/accent colors.

```typescript
theme.colors.secondary[50]   // '#f0fdfa'
theme.colors.secondary[100]  // '#ccfbf1'
theme.colors.secondary[200]  // '#99f6e4'
theme.colors.secondary[300]  // '#5eead4'
theme.colors.secondary[400]  // '#2dd4bf'
theme.colors.secondary[500]  // '#14b8a6'
theme.colors.secondary[600]  // '#0d9488' - Default secondary
theme.colors.secondary[700]  // '#0f766e'
theme.colors.secondary[800]  // '#115e59'
theme.colors.secondary[900]  // '#134e4a'
theme.colors.secondary[950]  // '#042f2e'
```

### Semantic Colors

Colors for status indicators and feedback.

#### Success

```typescript
theme.colors.semantic.success.light   // '#10b981'
theme.colors.semantic.success.DEFAULT // '#059669'
theme.colors.semantic.success.dark   // '#047857'
```

#### Error

```typescript
theme.colors.semantic.error.light   // '#ef4444'
theme.colors.semantic.error.DEFAULT // '#dc2626'
theme.colors.semantic.error.dark   // '#b91c1c'
```

#### Warning

```typescript
theme.colors.semantic.warning.light   // '#f59e0b'
theme.colors.semantic.warning.DEFAULT // '#d97706'
theme.colors.semantic.warning.dark   // '#b45309'
```

#### Info

```typescript
theme.colors.semantic.info.light   // '#3b82f6'
theme.colors.semantic.info.DEFAULT // '#2563eb'
theme.colors.semantic.info.dark   // '#1d4ed8'
```

### Neutral Colors

Gray scale for backgrounds, borders, and text.

```typescript
theme.colors.neutral[50]   // '#f9fafb'
theme.colors.neutral[100]  // '#f3f4f6'
theme.colors.neutral[200]  // '#e5e7eb'
theme.colors.neutral[300]  // '#d1d5db'
theme.colors.neutral[400]  // '#9ca3af'
theme.colors.neutral[500]  // '#6b7280'
theme.colors.neutral[600]  // '#4b5563'
theme.colors.neutral[700]  // '#374151'
theme.colors.neutral[800]  // '#1f2937'
theme.colors.neutral[900]  // '#111827'
theme.colors.neutral[950]  // '#030712'
```

### Functional Colors

Theme-aware colors for backgrounds, text, and borders.

#### Background

```typescript
theme.colors.functional.background.light   // '#ffffff'
theme.colors.functional.background.dark    // '#12121a'
theme.colors.functional.background.darker  // '#0a0a0f'
```

#### Text

```typescript
// Primary text
theme.colors.functional.text.primary.light // '#111827'
theme.colors.functional.text.primary.dark  // '#f9fafb'

// Secondary text
theme.colors.functional.text.secondary.light // '#6b7280'
theme.colors.functional.text.secondary.dark  // '#9ca3af'

// Muted text
theme.colors.functional.text.muted.light // '#9ca3af'
theme.colors.functional.text.muted.dark  // 'rgba(255,255,255,0.4)'
```

#### Border

```typescript
theme.colors.functional.border.light // '#e5e7eb'
theme.colors.functional.border.dark  // 'rgba(255,255,255,0.12)'
```

## Typography

### Font Families

```typescript
theme.typography.fontFamily.sans // ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif']
theme.typography.fontFamily.mono // ['Menlo', 'Monaco', 'Courier New', 'monospace']
```

### Font Sizes

Font sizes are objects with `size`, `lineHeight`, and `letterSpacing` properties.

```typescript
// Access size
theme.typography.fontSize.xs[0]      // '0.75rem'
theme.typography.fontSize.sm[0]      // '0.875rem'
theme.typography.fontSize.base[0]     // '1rem'
theme.typography.fontSize.lg[0]      // '1.125rem'
theme.typography.fontSize.xl[0]      // '1.25rem'
theme.typography.fontSize['2xl'][0]   // '1.5rem'
theme.typography.fontSize['3xl'][0]  // '1.875rem'
theme.typography.fontSize['4xl'][0]  // '2.25rem'
theme.typography.fontSize['5xl'][0]  // '3rem'
theme.typography.fontSize.label[0]    // '0.7rem'
theme.typography.fontSize.display[0] // '3.5rem'

// Access line height
theme.typography.fontSize.base[1].lineHeight // '1.5rem'

// Access letter spacing
theme.typography.fontSize.base[1].letterSpacing // '0em'
```

### Font Weights

```typescript
theme.typography.fontWeight.light    // 300
theme.typography.fontWeight.normal   // 400
theme.typography.fontWeight.medium   // 500
theme.typography.fontWeight.semibold // 600
theme.typography.fontWeight.bold     // 700
theme.typography.fontWeight.extrabold // 800
```

### Text Styles

```typescript
theme.typography.textStyle.uppercase.textTransform  // 'uppercase'
theme.typography.textStyle.uppercase.letterSpacing  // '0.2em'
theme.typography.textStyle.lowercase.textTransform  // 'lowercase'
theme.typography.textStyle.capitalize.textTransform // 'capitalize'
```

## Spacing

### Scale

Numeric spacing scale from 0 to 24.

```typescript
theme.spacing.scale[0]  // '0'
theme.spacing.scale[1]  // '0.25rem' (4px)
theme.spacing.scale[2]  // '0.5rem' (8px)
theme.spacing.scale[3]  // '0.75rem' (12px)
theme.spacing.scale[4]  // '1rem' (16px)
theme.spacing.scale[5]  // '1.25rem' (20px)
theme.spacing.scale[6]  // '1.5rem' (24px)
theme.spacing.scale[8]  // '2rem' (32px)
theme.spacing.scale[10] // '2.5rem' (40px)
theme.spacing.scale[12] // '3rem' (48px)
theme.spacing.scale[16] // '4rem' (64px)
theme.spacing.scale[20] // '5rem' (80px)
theme.spacing.scale[24] // '6rem' (96px)
```

### Semantic Spacing

Named spacing values for common use cases.

```typescript
theme.spacing.semantic.xs   // '0.5rem'
theme.spacing.semantic.sm   // '0.75rem'
theme.spacing.semantic.md   // '1rem'
theme.spacing.semantic.lg   // '1.5rem'
theme.spacing.semantic.xl   // '2rem'
theme.spacing.semantic['2xl'] // '3rem'
theme.spacing.semantic['3xl'] // '4rem'
```

### Component Spacing

Pre-defined padding values for components.

#### Button Padding

```typescript
theme.spacing.component.button.sm // '0.5rem 1rem'
theme.spacing.component.button.md // '0.625rem 1.25rem'
theme.spacing.component.button.lg // '0.75rem 1.5rem'
```

#### Input Padding

```typescript
theme.spacing.component.input.sm // '0.5rem 0.75rem'
theme.spacing.component.input.md // '0.625rem 1rem'
theme.spacing.component.input.lg // '0.75rem 1.25rem'
```

#### Card Padding

```typescript
theme.spacing.component.card.sm // '1rem'
theme.spacing.component.card.md // '1.5rem'
theme.spacing.component.card.lg // '2rem'
```

## Shadows

### Standard Shadows

```typescript
theme.shadows.standard.sm      // '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
theme.shadows.standard.DEFAULT // '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
theme.shadows.standard.md      // '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
theme.shadows.standard.lg      // '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
theme.shadows.standard.xl      // '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
theme.shadows.standard['2xl']  // '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
theme.shadows.standard.inner   // 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
```

### Dark Mode Shadows

Optimized shadows for dark theme.

```typescript
theme.shadows.dark.sm          // '0 1px 2px 0 rgba(0, 0, 0, 0.3)'
theme.shadows.dark.md          // '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)'
theme.shadows.dark.lg          // '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)'
theme.shadows.dark['gray-900/50'] // '0 4px 6px -1px rgba(17, 24, 39, 0.5)'
theme.shadows.dark['gray-900/70'] // '0 10px 15px -3px rgba(17, 24, 39, 0.7)'
```

### Colored Shadows

Focus ring shadows for interactive elements.

```typescript
theme.shadows.colored.primary  // '0 0 0 3px rgba(79, 70, 229, 0.1)'
theme.shadows.colored.secondary // '0 0 0 3px rgba(20, 184, 166, 0.1)'
theme.shadows.colored.success   // '0 0 0 3px rgba(16, 185, 129, 0.1)'
theme.shadows.colored.error     // '0 0 0 3px rgba(239, 68, 68, 0.1)'
```

## Borders

### Border Radius

```typescript
theme.borders.radius.none  // '0'
theme.borders.radius.sm    // '0.125rem'
theme.borders.radius.DEFAULT // '0.25rem'
theme.borders.radius.md    // '0.375rem'
theme.borders.radius.lg    // '0.5rem'
theme.borders.radius.xl    // '0.75rem'
theme.borders.radius['2xl'] // '1rem'
theme.borders.radius['3xl'] // '1.5rem'
theme.borders.radius.full  // '9999px'
```

### Border Width

```typescript
theme.borders.width[0] // '0'
theme.borders.width[1] // '1px'
theme.borders.width[2] // '2px'
theme.borders.width[4] // '4px'
theme.borders.width[8] // '8px'
```

### Border Style

```typescript
theme.borders.style.solid   // 'solid'
theme.borders.style.dashed   // 'dashed'
theme.borders.style.dotted   // 'dotted'
theme.borders.style.none     // 'none'
```

### Border Colors

```typescript
theme.borders.color.light    // '#e5e7eb'
theme.borders.color.dark     // 'rgba(255,255,255,0.12)'
theme.borders.color.primary  // '#4f46e5'
theme.borders.color.secondary // '#14b8a6'
```

## Transitions

### Duration

```typescript
theme.transitions.duration[75]   // '75ms'
theme.transitions.duration[100] // '100ms'
theme.transitions.duration[150] // '150ms'
theme.transitions.duration[200] // '200ms'
theme.transitions.duration[300] // '300ms'
theme.transitions.duration[500] // '500ms'
theme.transitions.duration[700] // '700ms'
theme.transitions.duration[1000] // '1000ms'
```

### Timing Functions

```typescript
theme.transitions.timing.linear    // 'linear'
theme.transitions.timing.easeIn    // 'cubic-bezier(0.4, 0, 1, 1)'
theme.transitions.timing.easeOut   // 'cubic-bezier(0, 0, 0.2, 1)'
theme.transitions.timing.easeInOut // 'cubic-bezier(0.4, 0, 0.2, 1)'
```

### Presets

Pre-configured transition strings.

```typescript
theme.transitions.preset.default   // 'all 200ms ease-in-out'
theme.transitions.preset.colors    // 'color 200ms ease-in-out, background-color 200ms ease-in-out, border-color 200ms ease-in-out'
theme.transitions.preset.opacity   // 'opacity 200ms ease-in-out'
theme.transitions.preset.transform // 'transform 200ms ease-in-out'
theme.transitions.preset.shadow    // 'box-shadow 200ms ease-in-out'
```

## Breakpoints

Responsive breakpoints for media queries.

```typescript
theme.breakpoints.mobile // '480px'
theme.breakpoints.sm     // '640px'
theme.breakpoints.md     // '768px'
theme.breakpoints.lg     // '1024px'
theme.breakpoints.xl     // '1280px'
theme.breakpoints['2xl'] // '1536px'
```

### Usage Example

```typescript
// CSS-in-JS
const mediaQuery = `@media (min-width: ${theme.breakpoints.md}) {
  /* styles */
}`;

// JavaScript
if (window.innerWidth >= parseInt(theme.breakpoints.md)) {
  // desktop styles
}
```

## Z-Index

### Scale

Numeric z-index scale.

```typescript
theme.zIndex.scale.auto // 'auto'
theme.zIndex.scale[0]   // '0'
theme.zIndex.scale[10]  // '10'
theme.zIndex.scale[20]  // '20'
theme.zIndex.scale[30]  // '30'
theme.zIndex.scale[40]  // '40'
theme.zIndex.scale[50]  // '50'
```

### Semantic Z-Index

Named z-index values for UI layers.

```typescript
theme.zIndex.semantic.dropdown      // 1000
theme.zIndex.semantic.sticky         // 1020
theme.zIndex.semantic.fixed          // 1030
theme.zIndex.semantic.modalBackdrop  // 1040
theme.zIndex.semantic.modal          // 1050
theme.zIndex.semantic.popover        // 1060
theme.zIndex.semantic.tooltip        // 1070
theme.zIndex.semantic.notification   // 1080
```

## Themes

Pre-configured theme values for light and dark modes.

### Light Theme

```typescript
theme.themes.light.background         // '#ffffff'
theme.themes.light.backgroundSecondary // '#f9fafb'
theme.themes.light.textPrimary        // '#111827'
theme.themes.light.textSecondary      // '#6b7280'
theme.themes.light.textMuted          // '#9ca3af'
theme.themes.light.border             // '#e5e7eb'
```

### Dark Theme

```typescript
theme.themes.dark.background         // '#12121a'
theme.themes.dark.backgroundSecondary // '#0a0a0f'
theme.themes.dark.textPrimary         // '#f9fafb'
theme.themes.dark.textSecondary       // 'rgba(255,255,255,0.4)'
theme.themes.dark.textMuted           // 'rgba(255,255,255,0.4)'
theme.themes.dark.border              // 'rgba(255,255,255,0.12)'
```

## TypeScript Types

The theme exports comprehensive TypeScript types for type safety.

### Available Types

```typescript
import type {
  Theme,
  ColorScale,
  SemanticColors,
  FunctionalColors,
  Typography,
  FontFamily,
  FontSize,
  FontWeight,
  TextStyle,
  Spacing,
  SpacingScale,
  SpacingSemantic,
  SpacingComponent,
  Shadows,
  ShadowStandard,
  ShadowDark,
  ShadowColored,
  Borders,
  BorderRadius,
  BorderWidth,
  BorderStyle,
  BorderColor,
  Transitions,
  TransitionDuration,
  TransitionTiming,
  TransitionPreset,
  Breakpoints,
  ZIndex,
  ZIndexScale,
  ZIndexSemantic,
  ThemeLight,
  ThemeDark,
} from './theme';
```

### Usage Example

```typescript
import { theme, type ColorScale } from './theme';

function getPrimaryColor(scale: keyof ColorScale): string {
  return theme.colors.primary[scale];
}

const color = getPrimaryColor(600); // Type-safe!
```

## Version

```typescript
import { THEME_VERSION } from './theme';
console.log(THEME_VERSION); // '1.0.0'
```

## Complete Example

```typescript
import { theme, THEME_VERSION } from './theme';

// Colors
const primaryColor = theme.colors.primary[600];
const successColor = theme.colors.semantic.success.DEFAULT;

// Typography
const fontSize = theme.typography.fontSize.base[0];
const lineHeight = theme.typography.fontSize.base[1].lineHeight;
const fontFamily = theme.typography.fontFamily.sans.join(', ');

// Spacing
const padding = theme.spacing.scale[4];
const buttonPadding = theme.spacing.component.button.md;

// Shadows
const shadow = theme.shadows.standard.md;

// Borders
const borderRadius = theme.borders.radius.md;

// Transitions
const transition = theme.transitions.preset.colors;

// Breakpoints
const mobileBreakpoint = theme.breakpoints.mobile;

// Z-Index
const modalZIndex = theme.zIndex.semantic.modal;
```

## CSS Variables

All theme values are also available as CSS variables. See `styles/themes.css` for the complete list.

### Usage

```css
.my-element {
  background-color: var(--color-primary-600);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
}
```

## Next Steps

- See [Integration Guide](./integration-guide.md) for setup instructions
- Check [Examples](../examples/) for framework-specific examples
- Review [Migration Guide](./migration-guide.md) for migration help

