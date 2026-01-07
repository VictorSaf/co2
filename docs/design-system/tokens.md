# Design Tokens

Design tokens are the foundational values that define the visual design of the application. All tokens are centralized in `src/design-system/tokens/` and exported through `src/design-system/tokens/index.ts`.

## Color Tokens

### Primary Colors
Brand primary colors (indigo scale):
- `colors.primary[50]` through `colors.primary[950]`
- Main color: `colors.primary[600]` (#4f46e5)

### Secondary Colors
Brand secondary colors (teal scale):
- `colors.secondary[50]` through `colors.secondary[950]`
- Main color: `colors.secondary[500]` (#14b8a6)

### Semantic Colors
Status and meaning colors:
- **Success**: `colors.semantic.success.DEFAULT`, `.light`, `.dark`
- **Error**: `colors.semantic.error.DEFAULT`, `.light`, `.dark`
- **Warning**: `colors.semantic.warning.DEFAULT`, `.light`, `.dark`
- **Info**: `colors.semantic.info.DEFAULT`, `.light`, `.dark`

### Neutral Colors
Gray scale for backgrounds and borders:
- `colors.neutral[50]` through `colors.neutral[950]`

### Functional Colors
Theme-aware colors for backgrounds, text, and borders:
- **Background**: `colors.functional.background.light`, `.dark`, `.darker`
- **Text**: 
  - Primary: `colors.functional.text.primary.light`, `.dark`
  - Secondary: `colors.functional.text.secondary.light`, `.dark`
  - Muted: `colors.functional.text.muted.light`, `.dark`
- **Border**: `colors.functional.border.light`, `.dark`

## Typography Tokens

### Font Families
- `typography.fontFamily.sans` - Primary sans-serif font stack
- `typography.fontFamily.mono` - Monospace font stack

### Font Sizes
- Standard sizes: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`
- Special sizes: `label` (0.7rem), `display` (3.5rem)

Each size includes line height and letter spacing:
```typescript
typography.fontSize.base // ['1rem', { lineHeight: '1.5rem', letterSpacing: '0em' }]
```

### Font Weights
- `light` (300), `normal` (400), `medium` (500), `semibold` (600), `bold` (700), `extrabold` (800)

### Text Styles
- `typography.textStyle.uppercase` - Uppercase with letter spacing
- `typography.textStyle.lowercase` - Lowercase
- `typography.textStyle.capitalize` - Capitalize

## Spacing Tokens

### Scale
- `spacing[0]` through `spacing[24]` (0 to 6rem)
- Common values: `spacing[1]` (0.25rem), `spacing[4]` (1rem), `spacing[6]` (1.5rem)

### Semantic Spacing
- `spacing.semantic.xs` through `spacing.semantic['3xl']`

### Component Spacing
- Button: `spacing.component.button.sm`, `.md`, `.lg`
- Input: `spacing.component.input.sm`, `.md`, `.lg`
- Card: `spacing.component.card.sm`, `.md`, `.lg`

## Shadow Tokens

### Standard Shadows
- `shadows.sm`, `shadows.DEFAULT`, `shadows.md`, `shadows.lg`, `shadows.xl`, `shadows['2xl']`, `shadows.inner`

### Dark Mode Shadows
- `shadows.dark.sm`, `shadows.dark.md`, `shadows.dark.lg`
- `shadows.dark['gray-900/50']`, `shadows.dark['gray-900/70']`

### Colored Shadows
- `shadows.colored.primary`, `.secondary`, `.success`, `.error`

## Border Tokens

### Border Radius
- `borders.radius.none`, `.sm`, `.DEFAULT`, `.md`, `.lg`, `.xl`, `.2xl`, `.3xl`, `.full`

### Border Width
- `borders.width[0]`, `.1`, `.2`, `.4`, `.8`

### Border Colors
- `borders.color.light`, `.dark`, `.primary`, `.secondary`

## Transition Tokens

### Durations
- `transitions.duration[75]` through `transitions.duration[1000]` (milliseconds)

### Timing Functions
- `transitions.timing.linear`, `.easeIn`, `.easeOut`, `.easeInOut`

### Presets
- `transitions.preset.default` - All properties, 200ms
- `transitions.preset.colors` - Color properties only
- `transitions.preset.opacity` - Opacity only
- `transitions.preset.transform` - Transform only
- `transitions.preset.shadow` - Box shadow only

## Breakpoint Tokens

- `breakpoints.sm` (640px) - Mobile landscape
- `breakpoints.md` (768px) - Tablet
- `breakpoints.lg` (1024px) - Desktop
- `breakpoints.xl` (1280px) - Large desktop
- `breakpoints['2xl']` (1536px) - Extra large desktop
- `breakpoints.mobile` (480px) - Mobile

## Z-Index Tokens

### Standard Scale
- `zIndex[0]` through `zIndex[50]`

### Semantic Z-Index
- `zIndex.semantic.dropdown` (1000)
- `zIndex.semantic.sticky` (1020)
- `zIndex.semantic.fixed` (1030)
- `zIndex.semantic.modalBackdrop` (1040)
- `zIndex.semantic.modal` (1050)
- `zIndex.semantic.popover` (1060)
- `zIndex.semantic.tooltip` (1070)
- `zIndex.semantic.notification` (1080)

## Usage in Tailwind

All tokens are integrated into Tailwind CSS configuration. You can use them directly in Tailwind classes:

```tsx
// Colors
<div className="bg-primary-600 text-white" />
<div className="bg-semantic-success text-white" />
<div className="bg-background text-text-primary" />

// Spacing
<div className="p-4 m-6" /> // Uses spacing tokens

// Typography
<p className="text-base font-semibold" /> // Uses typography tokens

// Shadows
<div className="shadow-md" /> // Uses shadow tokens

// Borders
<div className="rounded-md border-2" /> // Uses border tokens
```

## Usage in CSS

CSS variables are defined in `src/design-system/styles/themes.css`:

```css
.my-component {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  transition: var(--transition-default);
}
```

