/**
 * Button Component Example - Angular
 * 
 * This example demonstrates how to use the CO2 Trading Platform Design System Theme
 * in an Angular component. The Button component uses theme tokens for consistent styling.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { theme } from '../../tokens/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  template: `
    <button
      [ngStyle]="buttonStyle"
      (mouseenter)="isHovered = true"
      (mouseleave)="isHovered = false"
      (click)="onClick.emit()"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Output() onClick = new EventEmitter<void>();

  isHovered = false;

  // Get styles based on variant
  private getVariantStyles(): Record<string, string> {
    switch (this.variant) {
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
  }

  // Get padding based on size
  private getPadding(): string {
    return theme.spacing.component.button[this.size];
  }

  get buttonStyle(): Record<string, string> {
    const baseStyle: Record<string, string> = {
      ...this.getVariantStyles(),
      padding: this.getPadding(),
      borderRadius: theme.borders.radius.md,
      fontSize: theme.typography.fontSize.base[0],
      fontFamily: theme.typography.fontFamily.sans.join(', '),
      fontWeight: theme.typography.fontWeight.medium.toString(),
      cursor: 'pointer',
      transition: theme.transitions.preset.colors,
      boxShadow: theme.shadows.standard.sm,
    };

    if (this.isHovered) {
      const hoverBackgroundColor = this.variant === 'outline' 
        ? theme.colors.primary[50] 
        : this.variant === 'primary'
        ? theme.colors.primary[700]
        : theme.colors.secondary[700];

      return {
        ...baseStyle,
        backgroundColor: hoverBackgroundColor,
        boxShadow: theme.shadows.standard.md,
      };
    }

    return baseStyle;
  }
}

/*
Usage example:
<app-button variant="primary" size="md" (onClick)="handleClick()">
  Click me
</app-button>
*/

