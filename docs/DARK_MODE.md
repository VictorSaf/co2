# Dark Mode Documentation

## Overview

The CO2 Trading Platform includes a complete dark mode implementation that provides users with a comfortable viewing experience in low-light conditions. The dark mode feature is fully integrated across the application, including all UI components and Chart.js visualizations.

## Architecture

### Theme Management

Theme state is managed through React Context API (`src/context/ThemeContext.tsx`):

- **Provider**: `ThemeProvider` wraps the entire application in `src/App.tsx`
- **Hook**: `useTheme()` provides access to theme state and toggle function
- **Storage**: User preference persisted in `localStorage` with key `theme`
- **Values**: `'light'` or `'dark'`

### Tailwind CSS Configuration

Dark mode is implemented using Tailwind CSS class-based mode (`tailwind.config.js`):

```javascript
darkMode: 'class'
```

This requires the `dark` class to be present on the `<html>` element, which is automatically managed by `ThemeContext`.

### Initialization Flow

1. On app load, `ThemeProvider` checks `localStorage` for saved theme preference
2. If no saved preference exists, checks system preference via `prefers-color-scheme` media query
3. Defaults to `'light'` if neither preference is available
4. Applies appropriate class to `<html>` element and saves to `localStorage`

## Usage

### For Users

Toggle dark mode using the sun/moon icon button in the header:
- **Desktop**: Icon appears in the top-right navigation bar
- **Mobile**: Icon appears in the mobile menu header
- **Persistence**: Preference is saved automatically and persists across sessions

### For Developers

#### Using Theme in Components

```tsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-gray-800">
      <p className="text-gray-900 dark:text-gray-100">Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

#### Tailwind Dark Mode Classes

All components should use Tailwind's `dark:` prefix for dark mode variants:

- **Backgrounds**: `bg-white dark:bg-gray-800`, `bg-gray-100 dark:bg-gray-900`
- **Text**: `text-gray-900 dark:text-gray-100`, `text-gray-500 dark:text-gray-400`
- **Borders**: `border-gray-300 dark:border-gray-700`
- **Shadows**: `shadow dark:shadow-gray-900/50`
- **Hover States**: `hover:bg-gray-100 dark:hover:bg-gray-700`

#### Chart.js Integration

For Chart.js charts, use the `getChartThemeColors` utility from `src/utils/chartTheme.ts`:

```tsx
import { useTheme } from '../context/ThemeContext';
import { getChartThemeColors } from '../utils/chartTheme';

function MyChart() {
  const { theme } = useTheme();
  const themeColors = getChartThemeColors(theme);
  
  useEffect(() => {
    // Recreate chart when theme changes
    const chart = new Chart(ctx, {
      // ... chart config
      scales: {
        x: {
          grid: { color: themeColors.gridColor },
          ticks: { color: themeColors.textColor }
        },
        y: {
          grid: { color: themeColors.gridColor },
          ticks: { color: themeColors.textColor }
        }
      },
      plugins: {
        tooltip: {
          backgroundColor: themeColors.tooltipBg,
          titleColor: themeColors.tooltipText,
          bodyColor: themeColors.tooltipText,
          borderColor: themeColors.tooltipBorder
        },
        legend: {
          labels: { color: themeColors.textColor }
        }
      }
    });
    
    return () => chart.destroy();
  }, [theme]); // Recreate on theme change
}
```

## Color Palette

### Light Mode
- **Background**: `bg-gray-100` (page), `bg-white` (cards)
- **Text Primary**: `text-gray-900`
- **Text Secondary**: `text-gray-600`
- **Text Tertiary**: `text-gray-500`
- **Borders**: `border-gray-300`

### Dark Mode
- **Background**: `bg-gray-900` (page), `bg-gray-800` (cards)
- **Text Primary**: `text-gray-100`
- **Text Secondary**: `text-gray-400`
- **Text Tertiary**: `text-gray-500`
- **Borders**: `border-gray-700`

### Brand Colors
Primary (indigo) and secondary (teal) colors remain consistent across both themes for brand recognition.

## Global Styles

Global dark mode styles are defined in `src/index.css`:

- **Body**: `bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`
- **Card Component**: `bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50`
- **Input Component**: `bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600`
- **Button Components**: Maintain consistent styling with proper contrast in both themes

## Internationalization

Dark mode UI text is available in all supported languages:

- **English**: "Dark Mode", "Light Mode", "Toggle dark mode"
- **Romanian**: "Mod întunecat", "Mod deschis", "Comută modul întunecat"
- **Chinese**: "深色模式", "浅色模式", "切换深色模式"

Translation keys: `darkMode`, `lightMode`, `toggleDarkMode`

## Accessibility

- **Contrast**: All color combinations meet WCAG AA contrast standards
- **Focus States**: Visible focus indicators in both themes
- **ARIA Labels**: Dark mode toggle button includes proper ARIA labels
- **Keyboard Navigation**: Fully keyboard accessible

## Implementation Status

### ✅ Fully Implemented
- ThemeContext with localStorage persistence
- System preference detection
- Header toggle (desktop and mobile)
- Dashboard page dark mode
- Login page dark mode
- Dashboard Chart.js dark mode
- Global styles (body, cards, inputs, buttons)
- Component dark mode (LivePriceTicker, ActivityHistory)
- Logo theme switching (automatically switches between light/dark variants)
- i18n translations

### Component Support Pattern

When adding dark mode to new components:

1. Add `dark:` variants to all color-related classes
2. Test in both light and dark modes
3. Verify contrast ratios meet accessibility standards
4. Ensure interactive states (hover, focus) are visible in both themes

## Troubleshooting

### Theme Not Applying
- Verify `ThemeProvider` wraps the application in `src/App.tsx`
- Check that `dark` class is being added to `<html>` element
- Ensure Tailwind config has `darkMode: 'class'`

### Charts Not Updating
- Verify chart uses `useTheme()` hook
- Check that `theme` is included in `useEffect` dependencies
- Ensure chart is destroyed and recreated on theme change
- Verify `getChartThemeColors()` utility is being used

### localStorage Issues
- Check browser console for localStorage errors
- Verify `theme` key is being set correctly
- Clear localStorage if preference becomes corrupted: `localStorage.removeItem('theme')`

## Logo Theming

The application logo automatically adapts to the current theme:

- **Light Mode**: Displays `public/nihao-light.svg`
- **Dark Mode**: Displays `public/nihao-dark.svg`
- **Implementation**: Logo component (`src/components/Logo.tsx`) uses `useTheme()` hook
- **Error Handling**: Falls back to light logo if dark logo fails to load
- **Usage**: Always use `<Logo />` component instead of direct image references

## Technical Notes

- Theme preference is checked only on initialization (not synced with system preference changes after load)
- The `dark` class must be on `<html>` element (not `<body>`) for Tailwind to work correctly
- Chart.js requires manual color configuration - no automatic theme detection
- All dark mode classes use Tailwind's built-in color palette for consistency
- Logo component automatically responds to theme changes via `useTheme()` hook

