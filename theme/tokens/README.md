# Design Tokens

Acest folder conține toate tokenii de design în diferite formate pentru utilizare în aplicații.

## Fișiere Disponibile

### `theme.json`
Tema completă în format JSON. Compatibil cu orice aplicație JavaScript/TypeScript.

**Utilizare:**
```javascript
const theme = require('./theme.json');
const primaryColor = theme.colors.primary[600];
```

### `theme.ts`
Tema completă în format TypeScript cu tipizare completă. Exportă `theme` și `THEME_VERSION`.

**Utilizare:**
```typescript
import { theme, THEME_VERSION } from './theme';

const primaryColor = theme.colors.primary[600];
console.log(THEME_VERSION); // '1.0.0'
```

### `schema.json`
Schema JSON pentru validare. Poate fi folosită în IDE-uri pentru autocomplete și validare.

**Utilizare:**
```json
{
  "$schema": "./schema.json"
}
```

## Structura Tokenilor

### Culori
- `colors.primary` - Culori principale (indigo scale)
- `colors.secondary` - Culori secundare (teal scale)
- `colors.semantic` - Culori pentru status (success, error, warning, info)
- `colors.neutral` - Scala de gri
- `colors.functional` - Culori funcționale (background, text, border)

### Tipografie
- `typography.fontFamily` - Familii de fonturi
- `typography.fontSize` - Dimensiuni fonturi
- `typography.fontWeight` - Greutăți fonturi
- `typography.textStyle` - Stiluri text

### Spațiere
- `spacing.scale` - Scala de spațiere (0-24)
- `spacing.semantic` - Spațiere semantică (xs, sm, md, lg, xl)
- `spacing.component` - Spațiere pentru componente

### Umbre
- `shadows.standard` - Umbre standard
- `shadows.dark` - Umbre pentru dark mode
- `shadows.colored` - Umbre colorate

### Borduri
- `borders.radius` - Raze de colț
- `borders.width` - Lățimi borduri
- `borders.style` - Stiluri borduri
- `borders.color` - Culori borduri

### Tranziții
- `transitions.duration` - Durate tranziții
- `transitions.timing` - Funcții de timing
- `transitions.preset` - Preseturi tranziții

### Breakpoints
- `breakpoints.mobile` - 480px
- `breakpoints.sm` - 640px
- `breakpoints.md` - 768px
- `breakpoints.lg` - 1024px
- `breakpoints.xl` - 1280px
- `breakpoints.2xl` - 1536px

### Z-Index
- `zIndex.scale` - Scala z-index (0-50)
- `zIndex.semantic` - Z-index semantic (dropdown, modal, tooltip, etc.)

### Teme
- `themes.light` - Configurație light mode
- `themes.dark` - Configurație dark mode

## Exemple de Accesare

```typescript
import { theme } from './theme';

// Culori
const primary = theme.colors.primary[600];
const success = theme.colors.semantic.success.DEFAULT;

// Tipografie
const fontSize = theme.typography.fontSize.base[0];
const fontFamily = theme.typography.fontFamily.sans.join(', ');

// Spațiere
const padding = theme.spacing[4];
const buttonPadding = theme.spacing.component.button.md;

// Breakpoints
const mobile = theme.breakpoints.mobile;
```

Pentru documentație completă, vezi [Referință API](../docs/api-reference.md).

