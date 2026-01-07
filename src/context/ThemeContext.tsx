import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

/**
 * Theme type - either 'light' or 'dark'
 */
type Theme = 'light' | 'dark';

/**
 * Theme context interface providing theme state and toggle function
 */
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider component that manages application theme state
 * 
 * Features:
 * - Persists theme preference in localStorage
 * - Detects system preference on first load
 * - Applies 'dark' class to HTML element for Tailwind CSS dark mode
 * 
 * @param children - React children components
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  useEffect(() => {
    // Apply theme to HTML element
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * 
 * @returns Theme context with current theme and toggle function
 * @throws Error if used outside ThemeProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, toggleTheme } = useTheme();
 *   return <button onClick={toggleTheme}>Current: {theme}</button>;
 * }
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

