/**
 * Card Component Example - React
 * 
 * This example demonstrates how to use the CO2 Trading Platform Design System Theme
 * in a React Card component. The Card uses theme tokens for consistent styling.
 */

import React from 'react';
import { theme } from '../../tokens/theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ 
  children, 
  title,
  variant = 'default',
  padding = 'md'
}: CardProps) {
  // Get styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.functional.background.light,
          boxShadow: theme.shadows.standard.lg,
          border: 'none',
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.functional.background.light,
          boxShadow: 'none',
          border: `${theme.borders.width[1]} ${theme.borders.style.solid} ${theme.colors.functional.border.light}`,
        };
      default:
        return {
          backgroundColor: theme.colors.functional.background.light,
          boxShadow: theme.shadows.standard.md,
          border: 'none',
        };
    }
  };

  // Get padding based on size
  const getPadding = () => {
    return theme.spacing.component.card[padding];
  };

  const cardStyle: React.CSSProperties = {
    ...getVariantStyles(),
    padding: getPadding(),
    borderRadius: theme.borders.radius.lg,
    color: theme.colors.functional.text.primary.light,
    fontFamily: theme.typography.fontFamily.sans.join(', '),
  };

  const titleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xl[0],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.functional.text.primary.light,
    marginBottom: theme.spacing.scale[4],
    lineHeight: theme.typography.fontSize.xl[1].lineHeight,
  };

  return (
    <div style={cardStyle}>
      {title && <h3 style={titleStyle}>{title}</h3>}
      <div>{children}</div>
    </div>
  );
}

// Usage example:
// <Card title="Example Card" variant="elevated" padding="md">
//   <p>Card content goes here</p>
// </Card>

