# Design System Theme - Portable Package

Acest pachet conține toate detaliile temei grafice din aplicația CO2 Trading Platform într-un format portabil și reutilizabil în alte aplicații.

## Fișiere Disponibile

### 1. `design-system-theme.json`
Fișier JSON complet cu toate tokenii de design. Poate fi folosit în:
- Aplicații JavaScript/TypeScript
- Configurații Tailwind CSS
- Generatoare de teme
- Design tools (Figma, Sketch, etc.)

### 2. `design-system-theme.ts`
Fișier TypeScript cu tipizare completă. Poate fi importat direct în:
- Aplicații React/Next.js
- Aplicații Vue/Nuxt
- Aplicații Angular
- Orice proiect TypeScript

## Utilizare

### În JavaScript/TypeScript

```typescript
// Import tema completă
import { theme } from './design-system-theme';

// Accesare culori
const primaryColor = theme.colors.primary[600]; // '#4f46e5'
const successColor = theme.colors.semantic.success.DEFAULT; // '#059669'

// Accesare tipografie
// Notă: fontSize este un array [size, { lineHeight, letterSpacing }]
const baseFontSize = theme.typography.fontSize.base[0]; // '1rem'
const baseFontLineHeight = theme.typography.fontSize.base[1].lineHeight; // '1.5rem'
const fontFamily = theme.typography.fontFamily.sans; // ['Inter', ...]

// Accesare spacing
const padding = theme.spacing[4]; // '1rem'
const buttonPadding = theme.spacing.component.button.md; // '0.625rem 1.25rem'

// Accesare breakpoints
const mobileBreakpoint = theme.breakpoints.mobile; // '480px'
const desktopBreakpoint = theme.breakpoints.lg; // '1024px'
```

### În JSON

```javascript
// Import JSON
const theme = require('./design-system-theme.json');

// Accesare valori
const primaryColor = theme.colors.primary[600];
const fontSize = theme.typography.fontSize.base.size;
```

### În Tailwind CSS

```javascript
// tailwind.config.js
const theme = require('./design-system-theme.json');

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        semantic: {
          success: theme.colors.semantic.success,
          error: theme.colors.semantic.error,
          warning: theme.colors.semantic.warning,
          info: theme.colors.semantic.info,
        },
        neutral: theme.colors.neutral,
      },
      fontFamily: theme.typography.fontFamily,
      fontSize: Object.fromEntries(
        Object.entries(theme.typography.fontSize).map(([key, value]) => [
          key,
          [value.size, value]
        ])
      ),
      spacing: theme.spacing.scale,
      boxShadow: theme.shadows.standard,
      borderRadius: theme.borders.radius,
      screens: theme.breakpoints,
    },
  },
};
```

### În CSS Variables

```css
/* Generare CSS variables din tema */
:root {
  --color-primary-600: #4f46e5;
  --color-secondary-500: #14b8a6;
  --spacing-4: 1rem;
  --font-size-base: 1rem;
  /* ... etc */
}
```

### În React/Next.js

```tsx
// components/Button.tsx
import { theme } from '../design-system-theme';

export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={{
        backgroundColor: theme.colors.primary[600],
        color: 'white',
        padding: theme.spacing.component.button.md,
        borderRadius: theme.borders.radius.md,
        fontSize: theme.typography.fontSize.base[0],
        fontFamily: theme.typography.fontFamily.sans.join(', '),
      }}
    >
      {children}
    </button>
  );
}
```

### În Vue.js

```vue
<template>
  <button :style="buttonStyle">
    {{ text }}
  </button>
</template>

<script setup lang="ts">
import { theme } from './design-system-theme';
import { computed } from 'vue';

const buttonStyle = computed(() => ({
  backgroundColor: theme.colors.primary[600],
  color: 'white',
  padding: theme.spacing.component.button.md,
  borderRadius: theme.borders.radius.md,
}));
</script>
```

### În Angular

```typescript
// button.component.ts
import { Component } from '@angular/core';
import { theme } from './design-system-theme';

@Component({
  selector: 'app-button',
  template: `
    <button [ngStyle]="buttonStyle">
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  buttonStyle = {
    backgroundColor: theme.colors.primary[600],
    color: 'white',
    padding: theme.spacing.component.button.md,
    borderRadius: theme.borders.radius.md,
  };
}
```

## Structura Temei

### Culori
- **Primary**: Culori principale de brand (indigo scale)
- **Secondary**: Culori secundare/accent (teal scale)
- **Semantic**: Culori pentru status (success, error, warning, info)
- **Neutral**: Scala de gri pentru backgrounds și borders
- **Functional**: Culori funcționale pentru background, text, border (light/dark)

### Tipografie
- **Font Families**: Sans-serif (Inter) și monospace
- **Font Sizes**: De la xs (0.75rem) la display (3.5rem)
- **Font Weights**: De la light (300) la extrabold (800)
- **Text Styles**: Uppercase, lowercase, capitalize

### Spațiere
- **Scale**: 0-24 (0 la 6rem)
- **Semantic**: xs, sm, md, lg, xl, 2xl, 3xl
- **Component**: Padding specific pentru button, input, card

### Umbre
- **Standard**: sm, md, lg, xl, 2xl, inner
- **Dark Mode**: Umbre optimizate pentru dark theme
- **Colored**: Umbre colorate pentru focus states

### Borduri
- **Radius**: De la none la full (9999px)
- **Width**: 0, 1px, 2px, 4px, 8px
- **Style**: solid, dashed, dotted, none
- **Colors**: Light, dark, primary, secondary

### Tranziții
- **Duration**: 75ms - 1000ms
- **Timing**: linear, easeIn, easeOut, easeInOut
- **Presets**: default, colors, opacity, transform, shadow

### Breakpoints
- **mobile**: 480px
- **sm**: 640px (Mobile landscape)
- **md**: 768px (Tablet)
- **lg**: 1024px (Desktop)
- **xl**: 1280px (Large desktop)
- **2xl**: 1536px (Extra large desktop)

### Z-Index
- **Scale**: 0-50
- **Semantic**: dropdown, sticky, fixed, modalBackdrop, modal, popover, tooltip, notification

### Teme
- **Light**: Configurație pentru light mode
- **Dark**: Configurație pentru dark mode

## Exemple de Integrare

### Styled Components

```typescript
import styled from 'styled-components';
import { theme } from './design-system-theme';

const Button = styled.button`
  background-color: ${theme.colors.primary[600]};
  color: white;
  padding: ${theme.spacing.component.button.md};
  border-radius: ${theme.borders.radius.md};
  font-size: ${theme.typography.fontSize.base[0]};
  font-family: ${theme.typography.fontFamily.sans.join(', ')};
  transition: ${theme.transitions.preset.colors};
  
  &:hover {
    background-color: ${theme.colors.primary[700]};
  }
`;
```

### Emotion CSS

```typescript
import { css } from '@emotion/react';
import { theme } from './design-system-theme';

const buttonStyle = css`
  background-color: ${theme.colors.primary[600]};
  color: white;
  padding: ${theme.spacing.component.button.md};
  border-radius: ${theme.borders.radius.md};
`;
```

### CSS Modules

```css
/* button.module.css */
.button {
  background-color: var(--color-primary-600);
  color: white;
  padding: var(--spacing-button-md);
  border-radius: var(--border-radius-md);
}
```

## Versiune

**Versiune**: 1.0.0  
**Data**: 2024  
**Aplicație sursă**: CO2 Trading Platform

### Verificare Versiune

```typescript
// TypeScript
import { THEME_VERSION } from './design-system-theme';
console.log(THEME_VERSION); // '1.0.0'

// JSON
const theme = require('./design-system-theme.json');
console.log(theme.version); // '1.0.0'
```

## Validare

Pentru a valida că fișierele sunt sincronizate corect, rulează scriptul de validare:

```bash
node scripts/validate-theme.js
```

Scriptul verifică:
- Validitatea JSON-ului
- Consistența versiunilor între JSON și TypeScript
- Prezența tuturor cheilor necesare
- Corectitudinea valorilor de culoare și breakpoints

## Licență

Această temă grafică este parte a aplicației CO2 Trading Platform și poate fi folosită în alte proiecte conform licenței aplicației principale.

## Note

- Toate valorile sunt în format CSS standard (rem, px, rgba, etc.)
- Culorile funcționale includ variante pentru light și dark mode
- Breakpoints-urile sunt optimizate pentru design responsive
- Z-index-ul semantic asigură ordinea corectă a straturilor UI

## Fișiere Suplimentare

### `design-system-theme.schema.json`
Schema JSON pentru validare. Poate fi folosită în:
- IDE-uri pentru autocomplete și validare
- Validatori JSON
- Generatoare de cod

### `design-system-theme.package.json`
Template pentru distribuție npm. Conține:
- Configurație pentru publicare npm
- Exports pentru diferite formate
- Script de validare
- Metadata pentru package

### `scripts/validate-theme.js`
Script de validare care verifică:
- Validitatea JSON-ului
- Consistența versiunilor
- Prezența tuturor cheilor necesare
- Corectitudinea valorilor

## Suport

Pentru întrebări sau probleme legate de utilizarea acestei teme, consultați documentația completă din `docs/design-system/`.

