import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Logo component that displays the Nihao brand logo.
 * Automatically switches between light and dark variants based on the current theme.
 * 
 * @param className - Optional CSS classes for styling (default: 'h-8 w-auto')
 * @param alt - Optional alt text for accessibility (default: 'Nihao Carbon Certificates')
 * @returns React component rendering the theme-appropriate logo
 * 
 * @example
 * ```tsx
 * // Basic usage with defaults
 * <Logo />
 * 
 * // Custom styling
 * <Logo className="h-12 w-auto" />
 * 
 * // Custom alt text
 * <Logo alt="Nihao Logo" />
 * ```
 */
interface LogoProps {
  className?: string;
  alt?: string;
}

export default function Logo({ className = 'h-8 w-auto', alt = 'Nihao Carbon Certificates' }: LogoProps) {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);

  const logoPath = theme === 'dark' ? '/nihao-dark.svg' : '/nihao-light.svg';
  const fallbackPath = '/nihao-light.svg'; // Fallback to light logo if error occurs

  const handleError = () => {
    if (!imageError) {
      setImageError(true);
    }
  };

  return (
    <img
      src={imageError ? fallbackPath : logoPath}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}

