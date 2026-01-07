# Configurații Framework-uri

Acest folder conține configurații exemplu pentru diferite framework-uri și tool-uri.

## Fișiere Disponibile

### `tailwind.config.js`
Configurație exemplu pentru Tailwind CSS care folosește tokeni din tema.

**Utilizare:**
```javascript
// tailwind.config.js
const theme = require('../tokens/theme.json');

module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        semantic: theme.colors.semantic,
        neutral: theme.colors.neutral,
      },
      fontFamily: theme.typography.fontFamily,
      fontSize: Object.fromEntries(
        Object.entries(theme.typography.fontSize).map(([key, value]) => [
          key,
          [value.size, { lineHeight: value.lineHeight, letterSpacing: value.letterSpacing }]
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

### `css-variables.css`
CSS variables generate automat din tokeni. Poate fi folosit independent de Tailwind.

**Utilizare:**
```html
<link rel="stylesheet" href="./configs/css-variables.css">
```

**Generare:**
Pentru a regenera acest fișier, rulează:
```bash
node ../../scripts/generate-css-variables.js
```

## Integrare cu Framework-uri

### Tailwind CSS

1. Copiază `tailwind.config.js` în proiectul tău
2. Ajustează path-urile către tokeni
3. Importă stilurile în fișierul principal CSS

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### CSS Variables (Vanilla)

1. Include `css-variables.css` sau `styles/themes.css`
2. Folosește variabilele în stilurile tale

```css
.button {
  background-color: var(--color-primary-600);
  padding: var(--spacing-4);
}
```

### Styled Components

```typescript
import styled from 'styled-components';
import { theme } from '../tokens/theme';

const Button = styled.button`
  background-color: ${theme.colors.primary[600]};
  padding: ${theme.spacing.component.button.md};
`;
```

### Emotion CSS

```typescript
import { css } from '@emotion/react';
import { theme } from '../tokens/theme';

const buttonStyle = css`
  background-color: ${theme.colors.primary[600]};
  padding: ${theme.spacing.component.button.md};
`;
```

Pentru mai multe detalii, vezi [Ghid Integrare](../docs/integration-guide.md).

