# Angular Examples

This directory contains Angular component examples demonstrating how to use the CO2 Trading Platform Design System Theme.

## Examples

### Button Component

**File:** `button.component.ts`

A fully functional Button component that uses theme tokens for:
- Colors (primary, secondary, outline variants)
- Spacing (sm, md, lg sizes)
- Typography (font size, family, weight)
- Borders (radius, width, style)
- Shadows (standard shadows)
- Transitions (color transitions)
- Hover states

**Usage:**
```html
<app-button variant="primary" size="md" (onClick)="handleClick()">
  Click me
</app-button>
```

## Integration Steps

### 1. Copy Theme Files

Copy the theme folder to your Angular project:

```bash
cp -r ../../theme ./src/themes/co2-trading-theme
```

### 2. Import Theme in Component

```typescript
import { theme } from '../themes/co2-trading-theme/tokens/theme';
```

### 3. Use Theme Tokens

```typescript
export class MyComponent {
  buttonStyle = {
    backgroundColor: theme.colors.primary[600],
    padding: theme.spacing.component.button.md,
    borderRadius: theme.borders.radius.md,
  };
}
```

### 4. Use in Template with ngStyle

```html
<button [ngStyle]="buttonStyle">Click me</button>
```

### 5. Import CSS (Optional)

If you want to use CSS variables, add to `styles.css`:

```css
@import './themes/co2-trading-theme/styles/themes.css';

.my-button {
  background-color: var(--color-primary-600);
  padding: var(--spacing-button-md);
}
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes the theme folder:

```json
{
  "compilerOptions": {
    "paths": {
      "@theme/*": ["./src/themes/co2-trading-theme/*"]
    }
  }
}
```

Then import:

```typescript
import { theme } from '@theme/tokens/theme';
```

## Best Practices

1. **Use Getters** - Use getter properties for computed styles based on component state
2. **Type Safety** - Use TypeScript types exported from the theme
3. **Reactive Styles** - Use `ngStyle` binding for dynamic styles
4. **Component Styles** - Consider using `@Component` styles with CSS variables for static styles
5. **Dark Mode** - Use functional colors for theme-aware components

## TypeScript Support

The theme exports comprehensive TypeScript types:

```typescript
import type { Theme, ColorScale, Spacing } from '../themes/co2-trading-theme/tokens/theme';
```

## Module Configuration

If using Angular modules, ensure the component is declared in your module:

```typescript
import { NgModule } from '@angular/core';
import { ButtonComponent } from './button.component';

@NgModule({
  declarations: [ButtonComponent],
  exports: [ButtonComponent],
})
export class ButtonModule {}
```

## Standalone Components

For standalone components (Angular 14+):

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { theme } from '../themes/co2-trading-theme/tokens/theme';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `...`,
})
export class ButtonComponent {
  // ...
}
```

## Next Steps

- See [Integration Guide](../../docs/integration-guide.md) for complete setup instructions
- Check [API Reference](../../docs/api-reference.md) for all available tokens
- Review [Migration Guide](../../docs/migration-guide.md) if migrating from another theme system

