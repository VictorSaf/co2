# Vue Examples

This directory contains Vue component examples demonstrating how to use the CO2 Trading Platform Design System Theme.

## Examples

### Button Component

**File:** `Button.example.vue`

A fully functional Button component that uses theme tokens for:
- Colors (primary, secondary, outline variants)
- Spacing (sm, md, lg sizes)
- Typography (font size, family, weight)
- Borders (radius, width, style)
- Shadows (standard shadows)
- Transitions (color transitions)
- Hover states

**Usage:**
```vue
<template>
  <Button 
    text="Click me" 
    variant="primary" 
    size="md" 
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import Button from './Button.example.vue';

const handleClick = () => {
  console.log('Button clicked!');
};
</script>
```

## Integration Steps

### 1. Copy Theme Files

Copy the theme folder to your Vue project:

```bash
cp -r ../../theme ./src/themes/co2-trading-theme
```

### 2. Import Theme

```typescript
import { theme } from '../themes/co2-trading-theme/tokens/theme';
```

### 3. Use Theme Tokens in Computed Properties

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { theme } from '../themes/co2-trading-theme/tokens/theme';

const buttonStyle = computed(() => ({
  backgroundColor: theme.colors.primary[600],
  padding: theme.spacing.component.button.md,
  borderRadius: theme.borders.radius.md,
}));
</script>
```

### 4. Import CSS (Optional)

If you want to use CSS variables:

```vue
<style>
@import '../themes/co2-trading-theme/styles/themes.css';

.my-button {
  background-color: var(--color-primary-600);
  padding: var(--spacing-button-md);
}
</style>
```

## Best Practices

1. **Use Computed Properties** - Use Vue's `computed()` for reactive theme-based styles
2. **TypeScript Support** - Use TypeScript for type safety with theme tokens
3. **Reactive Updates** - Theme values are reactive, so computed properties will update automatically
4. **Dark Mode** - Use functional colors for theme-aware components
5. **Composition API** - Use Composition API (`<script setup>`) for better organization

## TypeScript Support

The theme exports comprehensive TypeScript types:

```typescript
import type { Theme, ColorScale, Spacing } from '../themes/co2-trading-theme/tokens/theme';
```

## Nuxt.js Integration

For Nuxt.js projects:

1. Place theme files in `assets/themes/co2-trading-theme/`
2. Import in components or composables
3. Use in `nuxt.config.ts` for global configuration

## Next Steps

- See [Integration Guide](../../docs/integration-guide.md) for complete setup instructions
- Check [API Reference](../../docs/api-reference.md) for all available tokens
- Review [Migration Guide](../../docs/migration-guide.md) if migrating from another theme system

