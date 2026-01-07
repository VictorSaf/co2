/**
 * Card Component Types
 * 
 * TypeScript types and interfaces for the Card component.
 */

import { HTMLAttributes } from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
}

