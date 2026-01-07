# CO2 Trading Platform Design System Theme

Tema grafică completă și portabilă pentru aplicații web. Acest folder conține toate fișierele necesare pentru utilizarea temei grafice în alte aplicații.

## Quick Start

### Instalare

```bash
# Copiază folderul theme/ în proiectul tău
cp -r theme/ ./your-project/themes/co2-trading-theme
```

### Utilizare

#### JavaScript/TypeScript
```javascript
const theme = require('./theme/tokens/theme.json');
console.log(theme.colors.primary[600]);
```

#### React
```typescript
import { theme } from './theme/tokens/theme';
```

#### CSS Variables
```html
<link rel="stylesheet" href="./theme/styles/themes.css">
```

## Structura

- `tokens/` - Tokeni de design (JSON, TypeScript, Schema)
- `styles/` - Fișiere CSS (base, components, utilities, themes)
- `configs/` - Configurații framework-uri (Tailwind, CSS variables)
- `examples/` - Exemple utilizare (React, Vue, Angular, vanilla)
- `docs/` - Documentație detaliată

## Documentație

- [Ghid Integrare](./docs/integration-guide.md)
- [Referință API](./docs/api-reference.md)
- [Exemple](./examples/)

## Versiune

**Versiune:** 1.0.0

## Licență

Această temă grafică este parte a aplicației CO2 Trading Platform și poate fi folosită în alte proiecte conform licenței aplicației principale.

