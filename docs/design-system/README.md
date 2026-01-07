# Design System Documentation

## Overview

The design system provides a centralized, standardized approach to styling and theming across the application. All design values (colors, typography, spacing, etc.) are defined as tokens in a single location, enabling one-command theme changes that propagate throughout the entire application.

## Core Principle

**Components must NEVER use hard-coded design values.** All colors, spacing, typography, shadows, and other design properties must reference design tokens. This ensures consistency and enables theme changes from a single source.

## Structure

```
src/design-system/
├── tokens/          # Design tokens (colors, typography, spacing, etc.)
├── themes/          # Theme configurations (light, dark)
├── components/      # Reusable UI components
├── hooks/           # Design system hooks (useTheme, useMediaQuery)
├── utilities/       # Utility functions (cn, classNames)
└── styles/         # CSS files (base, components, utilities, themes)
```

## Quick Start

### Using Components

```tsx
import { Button, Input, Card, Badge } from '../design-system';

function MyComponent() {
  return (
    <Card variant="elevated" padding="lg">
      <Input label="Email" type="email" />
      <Button variant="primary" size="md">Submit</Button>
      <Badge variant="success">Active</Badge>
    </Card>
  );
}
```

### Using Tokens

```tsx
import { colors, typography, spacing } from '../design-system/tokens';

// Access token values programmatically
const primaryColor = colors.primary[600];
const fontSize = typography.fontSize.base;
const padding = spacing[4];
```

### Using Hooks

```tsx
import { useTheme, useBreakpoint } from '../design-system/hooks';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  const isDesktop = useBreakpoint('lg');
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      {isDesktop && <DesktopOnlyContent />}
    </div>
  );
}
```

## Design Tokens

See [tokens.md](./tokens.md) for complete token documentation.

## Components

See [components.md](./components.md) for component API documentation.

## Themes

See [themes.md](./themes.md) for theme system documentation.

## Hooks

See [hooks.md](./hooks.md) for design system hooks documentation (useTheme, useMediaQuery, useBreakpoint).

## Migration Guide

See [migration-guide.md](./migration-guide.md) for guidance on migrating existing components to use the design system.

## Examples

See [examples.md](./examples.md) for usage examples and patterns.

## Portable Theme Files

The design system theme is available in portable formats for use in other applications:

### Available Files

- **`design-system-theme.json`** - Complete theme in JSON format
  - Universal compatibility (JavaScript, Python, etc.)
  - Can be imported directly or used with build tools
  - Includes JSON schema reference for validation

- **`design-system-theme.ts`** - Complete theme in TypeScript format
  - Full type safety with TypeScript
  - Exports version constant (`THEME_VERSION`)
  - 20+ type exports for granular type safety
  - Can be imported directly in TypeScript/JavaScript projects

- **`design-system-theme.schema.json`** - JSON Schema for validation
  - Enables IDE autocomplete and validation
  - Can be used with JSON validators
  - Ensures structure consistency

- **`design-system-theme.package.json`** - npm package template
  - Ready for npm distribution
  - Includes proper exports configuration
  - Includes validation script

- **`DESIGN_SYSTEM_THEME_README.md`** - Complete usage documentation
  - Examples for React, Vue, Angular
  - Tailwind CSS integration guide
  - CSS variables generation examples

### Validation

Run the validation script to ensure theme files are in sync:

```bash
node scripts/validate-theme.js
```

The script validates:
- JSON syntax validity
- Version consistency between JSON and TypeScript
- Presence of all required keys
- Correctness of color values and breakpoints

### Usage in Other Projects

```typescript
// TypeScript/JavaScript
import { theme, THEME_VERSION } from './design-system-theme';
const primaryColor = theme.colors.primary[600];

// JSON
const theme = require('./design-system-theme.json');
const primaryColor = theme.colors.primary[600];
```

For complete usage examples and integration guides, see `DESIGN_SYSTEM_THEME_README.md` in the project root.

