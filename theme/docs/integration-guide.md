# Integration Guide

This guide provides step-by-step instructions for integrating the CO2 Trading Platform Design System Theme into your application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Framework-Specific Integration](#framework-specific-integration)
4. [Configuration](#configuration)
5. [Usage Examples](#usage-examples)

## Quick Start

### Copy the Theme Folder

```bash
# Copy the entire theme folder to your project
cp -r theme/ ./your-project/themes/co2-trading-theme
```

### Basic Usage

#### JavaScript/TypeScript

```javascript
const theme = require('./themes/co2-trading-theme/tokens/theme.json');
console.log(theme.colors.primary[600]); // '#4f46e5'
```

#### TypeScript

```typescript
import { theme, THEME_VERSION } from './themes/co2-trading-theme/tokens/theme';

const primaryColor = theme.colors.primary[600];
console.log(THEME_VERSION); // '1.0.0'
```

#### CSS Variables

```html
<link rel="stylesheet" href="./themes/co2-trading-theme/styles/themes.css">
```

## Installation

### Option 1: Copy Folder (Recommended for Most Projects)

1. Copy the `theme/` folder to your project
2. Place it in a location accessible to your build system
3. Import files as needed

### Option 2: npm Package (Future)

If published as an npm package:

```bash
npm install @co2-trading-platform/design-system-theme
```

```typescript
import { theme } from '@co2-trading-platform/design-system-theme';
```

### Option 3: Git Submodule

```bash
git submodule add <repository-url> themes/co2-trading-theme
```

## Framework-Specific Integration

### React / Next.js

#### Step 1: Copy Theme Files

```bash
cp -r theme/ ./src/themes/co2-trading-theme
```

#### Step 2: Import Theme

```typescript
// components/Button.tsx
import { theme } from '../themes/co2-trading-theme/tokens/theme';

export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={{
        backgroundColor: theme.colors.primary[600],
        color: 'white',
        padding: theme.spacing.component.button.md,
        borderRadius: theme.borders.radius.md,
        fontSize: theme.typography.fontSize.base[0],
        fontFamily: theme.typography.fontFamily.sans.join(', '),
      }}
    >
      {children}
    </button>
  );
}
```

#### Step 3: Import CSS (Optional)

```typescript
// In your main CSS file or _app.tsx
import '../themes/co2-trading-theme/styles/themes.css';
```

#### Step 4: Configure Tailwind (If Using Tailwind)

Copy `configs/tailwind.config.js` to your project root and adjust paths:

```javascript
// tailwind.config.js
const theme = require('./src/themes/co2-trading-theme/tokens/theme.json');

module.exports = {
  // ... your existing config
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary,
        // ... rest of config
      },
    },
  },
};
```

### Vue.js / Nuxt

#### Step 1: Copy Theme Files

```bash
cp -r theme/ ./themes/co2-trading-theme
```

#### Step 2: Create Component

```vue
<template>
  <button :style="buttonStyle">
    {{ text }}
  </button>
</template>

<script setup lang="ts">
import { theme } from '../themes/co2-trading-theme/tokens/theme';
import { computed } from 'vue';

const props = defineProps<{
  text: string;
}>();

const buttonStyle = computed(() => ({
  backgroundColor: theme.colors.primary[600],
  color: 'white',
  padding: theme.spacing.component.button.md,
  borderRadius: theme.borders.radius.md,
  fontSize: theme.typography.fontSize.base[0],
  fontFamily: theme.typography.fontFamily.sans.join(', '),
}));
</script>
```

#### Step 3: Import CSS

```vue
<!-- In your main layout or app.vue -->
<style>
@import './themes/co2-trading-theme/styles/themes.css';
</style>
```

### Angular

#### Step 1: Copy Theme Files

```bash
cp -r theme/ ./src/themes/co2-trading-theme
```

#### Step 2: Create Component

```typescript
// button.component.ts
import { Component } from '@angular/core';
import { theme } from '../themes/co2-trading-theme/tokens/theme';

@Component({
  selector: 'app-button',
  template: `
    <button [ngStyle]="buttonStyle">
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  buttonStyle = {
    backgroundColor: theme.colors.primary[600],
    color: 'white',
    padding: theme.spacing.component.button.md,
    borderRadius: theme.borders.radius.md,
    fontSize: theme.typography.fontSize.base[0],
    fontFamily: theme.typography.fontFamily.sans.join(', '),
  };
}
```

#### Step 3: Import CSS

```typescript
// styles.css or angular.json
@import './themes/co2-trading-theme/styles/themes.css';
```

### Vanilla JavaScript / HTML

#### Step 1: Copy Theme Files

```bash
cp -r theme/ ./themes/co2-trading-theme
```

#### Step 2: Include CSS

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="./themes/co2-trading-theme/styles/themes.css">
</head>
<body>
  <button class="my-button">Click me</button>
  
  <style>
    .my-button {
      background-color: var(--color-primary-600);
      color: white;
      padding: var(--spacing-4);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-base);
    }
  </style>
</body>
</html>
```

#### Step 3: Use JavaScript (Optional)

```html
<script type="module">
  import { theme } from './themes/co2-trading-theme/tokens/theme.ts';
  
  const button = document.querySelector('.my-button');
  button.style.backgroundColor = theme.colors.primary[600];
</script>
```

## Configuration

### Tailwind CSS Configuration

1. Copy `configs/tailwind.config.js` to your project root
2. Adjust the path to `theme.json`:

```javascript
const theme = require('./path/to/theme/tokens/theme.json');
```

3. Merge with your existing Tailwind config:

```javascript
module.exports = {
  // ... your existing config
  theme: {
    extend: {
      // ... merge theme extensions
    },
  },
};
```

### CSS Variables

If you want to regenerate CSS variables from `theme.json`:

```bash
node scripts/generate-css-variables.js
```

This will update `configs/css-variables.css` with the latest values from `theme.json`.

### Dark Mode

The theme supports dark mode via CSS variables. To enable:

```html
<html class="dark">
  <!-- Your content -->
</html>
```

Or use JavaScript:

```javascript
document.documentElement.classList.add('dark');
```

## Usage Examples

### Styled Components

```typescript
import styled from 'styled-components';
import { theme } from './themes/co2-trading-theme/tokens/theme';

const Button = styled.button`
  background-color: ${theme.colors.primary[600]};
  color: white;
  padding: ${theme.spacing.component.button.md};
  border-radius: ${theme.borders.radius.md};
  transition: ${theme.transitions.preset.colors};
  
  &:hover {
    background-color: ${theme.colors.primary[700]};
  }
`;
```

### Emotion CSS

```typescript
import { css } from '@emotion/react';
import { theme } from './themes/co2-trading-theme/tokens/theme';

const buttonStyle = css`
  background-color: ${theme.colors.primary[600]};
  color: white;
  padding: ${theme.spacing.component.button.md};
  border-radius: ${theme.borders.radius.md};
`;
```

### CSS Modules

```css
/* button.module.css */
.button {
  background-color: var(--color-primary-600);
  color: white;
  padding: var(--spacing-button-md);
  border-radius: var(--border-radius-md);
}
```

## Troubleshooting

### Import Errors

If you encounter import errors:

1. **Check file paths** - Ensure paths are correct relative to your project structure
2. **TypeScript configuration** - Add theme folder to `tsconfig.json` includes
3. **Module resolution** - Verify your bundler can resolve the theme files

### CSS Variables Not Working

1. **Check CSS import** - Ensure `themes.css` is imported
2. **Verify dark mode** - Check if dark mode class is applied correctly
3. **Browser support** - CSS variables require modern browsers

### Tailwind Not Picking Up Theme

1. **Check config path** - Verify path to `theme.json` is correct
2. **Restart dev server** - Tailwind requires restart after config changes
3. **Check content paths** - Ensure Tailwind content paths include your files

## Next Steps

- See [API Reference](./api-reference.md) for complete token documentation
- Check [Examples](../examples/) for framework-specific examples
- Review [Migration Guide](./migration-guide.md) if migrating from previous versions

