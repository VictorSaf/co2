# Vanilla JavaScript Examples

This directory contains vanilla HTML/CSS/JavaScript examples demonstrating how to use the CO2 Trading Platform Design System Theme without any framework.

## Examples

### Button Example

**File:** `button.html`

A complete HTML page demonstrating:
- CSS variables usage
- JavaScript theme token imports
- Dark mode support
- Multiple button variants
- Dynamic button creation

**Usage:**

Open `button.html` in a browser or serve it with a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Then open http://localhost:8000/button.html
```

## Integration Methods

### Method 1: CSS Variables (Recommended)

The easiest way to use the theme in vanilla HTML is through CSS variables:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="./themes/co2-trading-theme/styles/themes.css">
</head>
<body>
  <style>
    .my-button {
      background-color: var(--color-primary-600);
      padding: var(--spacing-button-md);
      border-radius: var(--border-radius-md);
    }
  </style>
  
  <button class="my-button">Click me</button>
</body>
</html>
```

### Method 2: JavaScript Import (ES Modules)

For dynamic styling or programmatic access:

```html
<script type="module">
  import { theme } from './themes/co2-trading-theme/tokens/theme.ts';
  
  const button = document.querySelector('.my-button');
  button.style.backgroundColor = theme.colors.primary[600];
  button.style.padding = theme.spacing.component.button.md;
</script>
```

### Method 3: JSON Import

For non-module environments:

```javascript
// Load theme.json
fetch('./themes/co2-trading-theme/tokens/theme.json')
  .then(response => response.json())
  .then(theme => {
    const button = document.querySelector('.my-button');
    button.style.backgroundColor = theme.colors.primary[600];
  });
```

## CSS Variables Reference

All theme values are available as CSS variables. See `styles/themes.css` for the complete list.

### Colors

```css
--color-primary-600: #4f46e5;
--color-secondary-600: #0d9488;
--color-success: #059669;
--color-error: #dc2626;
```

### Spacing

```css
--spacing-1: 0.25rem;
--spacing-4: 1rem;
--spacing-button-md: 0.625rem 1.25rem;
```

### Typography

```css
--font-family-sans: Inter, system-ui, sans-serif;
--font-size-base: 1rem;
--font-weight-medium: 500;
```

### Borders

```css
--border-radius-md: 0.375rem;
--border-width: 1px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
```

## Dark Mode

Enable dark mode by adding the `dark` class to the `<html>` element:

```javascript
document.documentElement.classList.add('dark');
```

Or toggle it:

```javascript
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}
```

## Best Practices

1. **Use CSS Variables** - Prefer CSS variables for static styles
2. **JavaScript for Dynamic** - Use JavaScript theme imports for dynamic styling
3. **Dark Mode** - Always test both light and dark modes
4. **Responsive** - Use breakpoint CSS variables for responsive design
5. **Performance** - CSS variables are more performant than JavaScript styling

## Browser Support

- **CSS Variables**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **ES Modules**: Modern browsers (Chrome 61+, Firefox 60+, Safari 10.1+)
- **JSON Import**: All browsers (via fetch API)

## File Structure

```
your-project/
├── index.html
├── styles.css
└── themes/
    └── co2-trading-theme/
        ├── tokens/
        ├── styles/
        └── configs/
```

## Next Steps

- See [Integration Guide](../../docs/integration-guide.md) for complete setup instructions
- Check [API Reference](../../docs/api-reference.md) for all available tokens
- Review [Migration Guide](../../docs/migration-guide.md) if migrating from another theme system

