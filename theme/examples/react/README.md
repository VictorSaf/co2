# React Examples

This directory contains React component examples demonstrating how to use the CO2 Trading Platform Design System Theme.

## Examples

### Button Component

**File:** `Button.example.tsx`

A fully functional Button component that uses theme tokens for:
- Colors (primary, secondary, outline variants)
- Spacing (sm, md, lg sizes)
- Typography (font size, family, weight)
- Borders (radius, width, style)
- Shadows (standard shadows)
- Transitions (color transitions)

**Usage:**
```tsx
import { Button } from './Button.example';

<Button variant="primary" size="md" onClick={() => console.log('Clicked!')}>
  Click me
</Button>
```

### Card Component

**File:** `Card.example.tsx`

A Card component demonstrating:
- Variants (default, elevated, outlined)
- Padding options (sm, md, lg)
- Typography for titles
- Shadows and borders
- Background colors

**Usage:**
```tsx
import { Card } from './Card.example';

<Card title="Example Card" variant="elevated" padding="md">
  <p>Card content goes here</p>
</Card>
```

## Integration Steps

### 1. Copy Theme Files

Copy the theme folder to your React project:

```bash
cp -r ../../theme ./src/themes/co2-trading-theme
```

### 2. Import Theme

```typescript
import { theme } from '../themes/co2-trading-theme/tokens/theme';
```

### 3. Use Theme Tokens

```typescript
const buttonStyle = {
  backgroundColor: theme.colors.primary[600],
  padding: theme.spacing.component.button.md,
  borderRadius: theme.borders.radius.md,
};
```

### 4. Import CSS (Optional)

If you want to use CSS variables:

```typescript
// In your main CSS file or App.tsx
import '../themes/co2-trading-theme/styles/themes.css';
```

Then use CSS variables:

```css
.my-button {
  background-color: var(--color-primary-600);
  padding: var(--spacing-button-md);
}
```

## Best Practices

1. **Use Theme Tokens** - Always reference theme tokens instead of hard-coding values
2. **Type Safety** - Use TypeScript types exported from the theme for type safety
3. **Consistent Spacing** - Use semantic spacing values (`theme.spacing.semantic.md`) or component-specific spacing (`theme.spacing.component.button.md`)
4. **Dark Mode Support** - Use functional colors (`theme.colors.functional.*`) for theme-aware colors
5. **Responsive Design** - Use breakpoints (`theme.breakpoints.*`) for responsive behavior

## TypeScript Support

The theme exports comprehensive TypeScript types:

```typescript
import type { Theme, ColorScale, Spacing } from '../themes/co2-trading-theme/tokens/theme';
```

## Next Steps

- See [Integration Guide](../../docs/integration-guide.md) for complete setup instructions
- Check [API Reference](../../docs/api-reference.md) for all available tokens
- Review [Migration Guide](../../docs/migration-guide.md) if migrating from another theme system

