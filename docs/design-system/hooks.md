# Design System Hooks

Design system hooks provide utilities for accessing theme information and responsive behavior.

## useTheme

Hook for accessing and controlling the application theme.

### Import

```tsx
import { useTheme } from '../design-system/hooks';
```

### Returns

```typescript
{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

### Usage

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

### Notes

- The hook re-exports `useTheme` from `ThemeContext` for design system usage
- Must be used within a `ThemeProvider` component
- Theme preference is persisted in `localStorage` with key `theme`
- Throws an error if used outside `ThemeProvider`

## useMediaQuery

Hook to check if a media query matches the current viewport.

### Import

```tsx
import { useMediaQuery } from '../design-system/hooks';
```

### Parameters

- `query: string` - Media query string (e.g., `'(min-width: 768px)'`)

### Returns

- `boolean` - `true` if the media query matches, `false` otherwise

### Usage

```tsx
import { useMediaQuery } from '../design-system/hooks';
import { breakpoints } from '../design-system/tokens';

function MyComponent() {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.md})`);
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  
  return (
    <div>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

### Notes

- Returns `false` during server-side rendering
- Automatically updates when the media query match state changes
- Uses `window.matchMedia` API with proper cleanup

## useBreakpoint

Hook to check if the screen is at or above a specific breakpoint.

### Import

```tsx
import { useBreakpoint } from '../design-system/hooks';
```

### Parameters

- `breakpoint: keyof typeof breakpoints` - Breakpoint key (`'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'mobile'`)

### Returns

- `boolean` - `true` if screen is at or above the breakpoint, `false` otherwise

### Usage

```tsx
import { useBreakpoint } from '../design-system/hooks';

function MyComponent() {
  const isTabletOrAbove = useBreakpoint('md');
  const isDesktop = useBreakpoint('lg');
  
  return (
    <div>
      {isTabletOrAbove && <TabletContent />}
      {isDesktop && <DesktopContent />}
    </div>
  );
}
```

### Available Breakpoints

- `'mobile'` - 480px
- `'sm'` - 640px (Mobile landscape)
- `'md'` - 768px (Tablet)
- `'lg'` - 1024px (Desktop)
- `'xl'` - 1280px (Large desktop)
- `'2xl'` - 1536px (Extra large desktop)

### Notes

- Built on top of `useMediaQuery` hook
- Uses breakpoint tokens from `src/design-system/tokens/breakpoints.ts`
- Automatically updates when viewport size changes

## Examples

### Conditional Rendering Based on Breakpoint

```tsx
import { useBreakpoint } from '../design-system/hooks';
import { Card } from '../design-system';

function ResponsiveGrid({ items }) {
  const isDesktop = useBreakpoint('lg');
  const isTablet = useBreakpoint('md');
  
  const columns = isDesktop ? 3 : isTablet ? 2 : 1;
  
  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {items.map((item) => (
        <Card key={item.id} padding="md">
          {item.content}
        </Card>
      ))}
    </div>
  );
}
```

### Theme-Aware Component

```tsx
import { useTheme } from '../design-system/hooks';
import { Button } from '../design-system';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      leftIcon={theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    >
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </Button>
  );
}
```

### Responsive Layout with Media Query

```tsx
import { useMediaQuery } from '../design-system/hooks';
import { breakpoints } from '../design-system/tokens';

function ResponsiveLayout() {
  const isSmallScreen = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  return (
    <div>
      {isSmallScreen ? (
        <MobileLayout />
      ) : (
        <DesktopLayout />
      )}
      {!prefersReducedMotion && <AnimatedBackground />}
    </div>
  );
}
```

## Best Practices

1. **Use breakpoint hook for responsive design** - Prefer `useBreakpoint` over `useMediaQuery` when checking breakpoints
2. **Memoize expensive computations** - If using hooks in render-heavy components, consider memoization
3. **Handle SSR** - Hooks return safe defaults during server-side rendering
4. **Combine with design tokens** - Use breakpoint tokens from the design system for consistency
5. **Test both themes** - Ensure components work correctly in both light and dark themes

