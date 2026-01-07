# Migration Guide

This guide helps you migrate existing components to use the design system.

## Migration Strategy

### Phase 1: Identify Hardcoded Values

Look for:
- Hardcoded hex colors (`#ffffff`, `#12121a`, etc.)
- Hardcoded rgba values (`rgba(255,255,255,0.4)`)
- Direct Tailwind color classes (`bg-red-600`, `text-gray-900`)
- Hardcoded spacing values
- Hardcoded font sizes

### Phase 2: Replace with Tokens

Replace hardcoded values with design tokens:

**Before:**
```tsx
<div className="bg-[#12121a] text-[rgba(255,255,255,0.85)] p-4">
  Content
</div>
```

**After:**
```tsx
<div className="bg-background-dark text-text-primary-dark p-4">
  Content
</div>
```

### Phase 3: Use Design System Components

Replace custom components with design system components:

**Before:**
```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded">
  Click me
</button>
```

**After:**
```tsx
import { Button } from '../design-system';

<Button variant="primary" size="md">Click me</Button>
```

## Common Migrations

### Colors

| Before | After |
|--------|-------|
| `bg-white` | `bg-background` |
| `bg-gray-800` | `bg-background-dark` |
| `text-gray-900` | `text-text-primary` |
| `text-gray-500` | `text-text-secondary` |
| `border-gray-300` | `border-border` |
| `bg-red-600` | `bg-semantic-error` |
| `bg-green-600` | `bg-semantic-success` |
| `bg-blue-600` | `bg-semantic-info` |
| `bg-yellow-600` | `bg-semantic-warning` |

### Typography

| Before | After |
|--------|-------|
| `text-[0.7rem]` | `text-label` |
| `text-sm` | `text-sm` (already uses tokens) |
| `font-semibold` | `font-semibold` (already uses tokens) |

### Spacing

Spacing values already use tokens when using Tailwind classes (`p-4`, `m-6`, etc.). For programmatic access:

```tsx
import { spacing } from '../design-system/tokens';

const padding = spacing[4]; // 1rem
```

## Component Migration Examples

### Button Migration

**Before:**
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Submit
</button>
```

**After:**
```tsx
import { Button } from '../design-system';

<Button variant="primary" size="md">Submit</Button>
```

### Input Migration

**Before:**
```tsx
<div>
  <label className="text-sm font-medium text-gray-900 mb-1">Email</label>
  <input 
    className="border border-gray-300 bg-white text-gray-900 rounded px-4 py-2"
    type="email"
  />
</div>
```

**After:**
```tsx
import { Input } from '../design-system';

<Input label="Email" type="email" />
```

### Card Migration

**Before:**
```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200">
  Content
</div>
```

**After:**
```tsx
import { Card } from '../design-system';

<Card variant="default" padding="md">Content</Card>
```

## Checklist

When migrating a component:

- [ ] Replace all hardcoded colors with design tokens
- [ ] Replace custom components with design system components
- [ ] Ensure dark mode support (use `dark:` variants)
- [ ] Test component in both light and dark themes
- [ ] Verify accessibility (ARIA labels, keyboard navigation)
- [ ] Check responsive behavior
- [ ] Remove unused custom styles
- [ ] Update imports to use design system

## Testing After Migration

1. **Visual Testing**: Check component appearance in both themes
2. **Accessibility Testing**: Verify keyboard navigation and screen reader support
3. **Responsive Testing**: Test on different screen sizes
4. **Interaction Testing**: Verify hover, focus, and active states
5. **Integration Testing**: Ensure component works with parent components

## Common Pitfalls

1. **Mixing old and new**: Don't mix hardcoded values with tokens
2. **Forgetting dark mode**: Always include dark mode variants
3. **Overriding component styles**: Use component props instead of overriding
4. **Not testing**: Always test after migration
5. **Breaking existing functionality**: Ensure migration doesn't break existing features

## Getting Help

If you encounter issues during migration:

1. Check component documentation in `docs/design-system/components.md`
2. Review token documentation in `docs/design-system/tokens.md`
3. Look at existing migrated components for examples
4. Consult the design system team

