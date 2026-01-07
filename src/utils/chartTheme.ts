/**
 * Utility functions for Chart.js theme configuration
 * Provides consistent dark mode colors across all charts
 */

export interface ChartThemeColors {
  gridColor: string;
  textColor: string;
  tooltipBg: string;
  tooltipText: string;
  tooltipBorder: string;
}

/**
 * Get Chart.js theme colors based on current theme
 * @param theme - Current theme ('light' | 'dark')
 * @returns ChartThemeColors object with theme-appropriate colors
 */
export function getChartThemeColors(theme: 'light' | 'dark'): ChartThemeColors {
  const isDark = theme === 'dark';
  
  return {
    gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    textColor: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    tooltipBg: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipText: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
    tooltipBorder: isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(0, 0, 0, 0.1)',
  };
}

