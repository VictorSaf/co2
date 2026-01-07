# Migration Guide

This guide helps you migrate from previous versions of the CO2 Trading Platform Design System Theme or from other theme systems.

## Table of Contents

1. [Migrating from Previous Versions](#migrating-from-previous-versions)
2. [Migrating from Other Theme Systems](#migrating-from-other-theme-systems)
3. [Breaking Changes](#breaking-changes)
4. [Migration Checklist](#migration-checklist)

## Migrating from Previous Versions

### Version 1.0.0

This is the first versioned release. If you were using the theme files from the root directory (`design-system-theme.json`, etc.), follow these steps:

#### Step 1: Update File Locations

**Old structure:**
```
project/
├── design-system-theme.json
├── design-system-theme.ts
└── design-system-theme.schema.json
```

**New structure:**
```
project/
└── theme/
    ├── tokens/
    │   ├── theme.json
    │   ├── theme.ts
    │   └── schema.json
    ├── styles/
    ├── configs/
    └── examples/
```

#### Step 2: Update Imports

**Before:**
```typescript
import { theme } from './design-system-theme';
```

**After:**
```typescript
import { theme } from './theme/tokens/theme';
```

#### Step 3: Update JSON Imports

**Before:**
```javascript
const theme = require('./design-system-theme.json');
```

**After:**
```javascript
const theme = require('./theme/tokens/theme.json');
```

#### Step 4: Update CSS Imports

**Before:**
```css
@import './src/design-system/styles/themes.css';
```

**After:**
```css
@import './theme/styles/themes.css';
```

#### Step 5: Update Tailwind Config

**Before:**
```javascript
const theme = require('./design-system-theme.json');
```

**After:**
```javascript
const theme = require('./theme/tokens/theme.json');
```

### No Breaking Changes in Token Structure

The token structure remains the same. All color, spacing, typography, and other token values are identical. Only file locations have changed.

## Migrating from Other Theme Systems

### From Material-UI / MUI

#### Color Mapping

```typescript
// Material-UI
import { createTheme } from '@mui/material/styles';
const muiTheme = createTheme({
  palette: {
    primary: { main: '#4f46e5' },
  },
});

// CO2 Trading Theme
import { theme } from './theme/tokens/theme';
const primaryColor = theme.colors.primary[600]; // '#4f46e5'
```

#### Spacing

```typescript
// Material-UI uses spacing multiplier (8px base)
muiTheme.spacing(2); // 16px

// CO2 Trading Theme uses rem values
theme.spacing.scale[4]; // '1rem' (16px)
```

### From Tailwind Default Theme

#### Colors

```typescript
// Tailwind default
const color = 'bg-indigo-600'; // Uses Tailwind's indigo

// CO2 Trading Theme
import { theme } from './theme/tokens/theme';
const color = theme.colors.primary[600]; // Same indigo scale
```

#### Typography

```typescript
// Tailwind default
className="text-base" // Uses Tailwind defaults

// CO2 Trading Theme
style={{ fontSize: theme.typography.fontSize.base[0] }}
```

### From Chakra UI

#### Color System

```typescript
// Chakra UI
const color = 'blue.600';

// CO2 Trading Theme
import { theme } from './theme/tokens/theme';
const color = theme.colors.primary[600];
```

#### Spacing Scale

```typescript
// Chakra UI uses 4px base
spacing={4} // 16px

// CO2 Trading Theme uses rem
theme.spacing.scale[4] // '1rem' (16px)
```

### From Ant Design

#### Color Palette

```typescript
// Ant Design
import { Button } from 'antd';
// Uses Ant Design's blue primary color

// CO2 Trading Theme
import { theme } from './theme/tokens/theme';
const primaryColor = theme.colors.primary[600];
```

## Breaking Changes

### Version 1.0.0

**No breaking changes** - This is the first versioned release. The structure is stable and ready for production use.

### Future Versions

When breaking changes occur in future versions, they will be documented here with:
- What changed
- Why it changed
- How to migrate
- Deprecation timeline

## Migration Checklist

Use this checklist to ensure a complete migration:

### Pre-Migration

- [ ] Backup your current theme files
- [ ] Review current theme usage in your codebase
- [ ] Identify all files importing theme values
- [ ] Document custom theme extensions

### Migration Steps

- [ ] Copy new `theme/` folder to your project
- [ ] Update all import statements
- [ ] Update CSS import paths
- [ ] Update Tailwind config (if applicable)
- [ ] Update build scripts
- [ ] Test all components using theme values
- [ ] Verify dark mode functionality
- [ ] Check responsive breakpoints

### Post-Migration

- [ ] Run your test suite
- [ ] Visual regression testing
- [ ] Verify in all target browsers
- [ ] Update documentation
- [ ] Remove old theme files (after verification)

## Common Issues

### Import Path Errors

**Problem:** Module not found errors after migration

**Solution:**
1. Verify file paths are correct
2. Check TypeScript/Babel configuration
3. Ensure theme folder is included in build

### CSS Variables Not Working

**Problem:** CSS variables undefined after migration

**Solution:**
1. Verify `themes.css` is imported
2. Check CSS import order
3. Ensure CSS file paths are correct

### TypeScript Type Errors

**Problem:** Type errors after updating imports

**Solution:**
1. Update `tsconfig.json` to include theme folder
2. Restart TypeScript server
3. Verify theme exports are correct

### Tailwind Not Recognizing Theme

**Problem:** Tailwind classes not working with new theme

**Solution:**
1. Update `tailwind.config.js` path to theme.json
2. Restart dev server
3. Clear Tailwind cache if applicable

## Getting Help

If you encounter issues during migration:

1. Check [API Reference](./api-reference.md) for token structure
2. Review [Examples](../examples/) for usage patterns
3. Verify your framework integration in [Integration Guide](./integration-guide.md)

## Version History

### Version 1.0.0 (Current)

- Initial versioned release
- Complete theme structure
- Full TypeScript support
- CSS variables support
- Tailwind configuration
- Framework examples

## Next Steps

After migration:

1. Review [Integration Guide](./integration-guide.md) for best practices
2. Check [API Reference](./api-reference.md) for available tokens
3. Explore [Examples](../examples/) for implementation patterns

