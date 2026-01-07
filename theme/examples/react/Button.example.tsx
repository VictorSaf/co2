/**
 * Button Component Example - React
 * 
 * This example demonstrates how to use the CO2 Trading Platform Design System Theme
 * in a React component. The Button component uses theme tokens for consistent styling.
 */

import React from 'react';
import { theme } from '../../tokens/theme';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick 
}: ButtonProps) {
  // Get styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary[600],
          color: 'white',
          border: 'none',
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary[600],
          color: 'white',
          border: 'none',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.primary[600],
          border: `${theme.borders.width[1]} ${theme.borders.style.solid} ${theme.colors.primary[600]}`,
        };
      default:
        return {};
    }
  };

  // Get padding based on size
  const getPadding = () => {
    return theme.spacing.component.button[size];
  };

  const buttonStyle: React.CSSProperties = {
    ...getVariantStyles(),
    padding: getPadding(),
    borderRadius: theme.borders.radius.md,
    fontSize: theme.typography.fontSize.base[0],
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: theme.transitions.preset.colors,
    boxShadow: theme.shadows.standard.sm,
  };

  const hoverStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: variant === 'outline' 
      ? theme.colors.primary[50] 
      : variant === 'primary'
      ? theme.colors.primary[700]
      : theme.colors.secondary[700],
    boxShadow: theme.shadows.standard.md,
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      style={isHovered ? hoverStyle : buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Usage example:
// <Button variant="primary" size="md" onClick={() => console.log('Clicked!')}>
//   Click me
// </Button>

