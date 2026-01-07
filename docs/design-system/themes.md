# Theme System Documentation

The design system supports a comprehensive theme system with light and dark modes, enabled through CSS variables and Tailwind CSS dark mode classes.

## Theme Configuration

Themes are defined in `src/design-system/themes/`:
- `light.ts` - Light theme configuration
- `dark.ts` - Dark theme configuration

## CSS Variables

CSS custom properties are defined in `src/design-system/styles/themes.css` and automatically switch based on the `.dark` class on the HTML element.

### Light Theme Variables

```css
:root {
  --color-background: #ffffff;
  --color-background-secondary: #f9fafb;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-border: #e5e7eb;
  /* ... more variables ... */
}
```

### Dark Theme Variables

```css
.dark {
  --color-background: #12121a;
  --color-background-secondary: #0a0a0f;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-text-muted: rgba(255, 255, 255, 0.4);
  --color-border: rgba(255, 255, 255, 0.12);
  /* ... more variables ... */
}
```

## Theme Provider

The `ThemeProvider` component manages theme state and applies the `dark` class to the HTML element.

### Usage

```tsx
import { ThemeProvider } from '../context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

## Using Theme Hook

```tsx
import { useTheme } from '../design-system/hooks';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## Theme Persistence

The theme preference is automatically saved to `localStorage` with the key `theme`. On first load, the system checks:
1. Saved preference in `localStorage`
2. System preference (`prefers-color-scheme` media query)
3. Defaults to `light` if neither is available

## Tailwind Dark Mode

The design system uses Tailwind's class-based dark mode (`darkMode: 'class'`). Components use the `dark:` prefix for dark mode variants:

```tsx
<div className="bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark">
  Content
</div>
```

## Component Theme Support

All design system components automatically support theme switching:

- **Button**: Uses theme-aware colors for all variants
- **Input**: Supports both default and dark variants
- **Card**: Background and borders adapt to theme
- **Badge**: Colors adjust for light/dark themes
- **Modal**: Backdrop and content adapt to theme
- **Table**: Rows and cells use theme-aware colors

## Custom Theme Colors

To add custom theme colors:

1. Add color values to `src/design-system/tokens/colors.ts`
2. Add CSS variables to `src/design-system/styles/themes.css`
3. Update Tailwind config in `tailwind.config.js` if needed
4. Use in components via Tailwind classes or CSS variables

## Best Practices

1. **Always use design tokens** - Never hardcode colors
2. **Test both themes** - Ensure components work in light and dark modes
3. **Use semantic colors** - Use `success`, `error`, `warning`, `info` for status
4. **Leverage CSS variables** - Use CSS variables for dynamic theming
5. **Consider contrast** - Ensure text meets WCAG contrast requirements in both themes

