# CSS Styles

Acest folder conține toate fișierele CSS necesare pentru tema grafică.

## Fișiere Disponibile

### `base.css`
Stiluri de bază, reset CSS și normalizare. Include:
- Reset CSS și normalizare
- Stiluri de bază pentru typography
- Variabile CSS de bază

**Utilizare:**
```html
<link rel="stylesheet" href="./styles/base.css">
```

### `components.css`
Stiluri pentru componente reutilizabile. Include:
- Clase pentru Button, Input, Card, Badge, Modal, Tooltip, Table, Form
- Variante componente
- Clase CSS reutilizabile

**Utilizare:**
```html
<link rel="stylesheet" href="./styles/components.css">
```

**Notă:** Acest fișier folosește Tailwind CSS. Dacă nu folosești Tailwind, vezi `themes.css` pentru CSS variables.

### `utilities.css`
Utilitare CSS custom și extensii Tailwind. Include:
- Utilitare CSS custom
- Clase helper
- Extensii Tailwind

**Utilizare:**
```html
<link rel="stylesheet" href="./styles/utilities.css">
```

### `themes.css`
CSS variables pentru light și dark theme. Poate fi folosit independent de Tailwind.

**Utilizare:**
```html
<link rel="stylesheet" href="./styles/themes.css">
```

**Exemplu:**
```css
.my-button {
  background-color: var(--color-primary-600);
  color: white;
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
}

.dark .my-button {
  background-color: var(--color-primary-500);
}
```

## Utilizare cu Tailwind CSS

Dacă folosești Tailwind CSS, importă fișierele în ordinea corectă:

```css
@import './styles/base.css';
@import './styles/components.css';
@import './styles/utilities.css';
```

Sau în fișierul principal CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './styles/base.css';
@import './styles/components.css';
@import './styles/utilities.css';
```

## Utilizare fără Tailwind CSS

Dacă nu folosești Tailwind CSS, folosește doar `themes.css`:

```html
<link rel="stylesheet" href="./styles/themes.css">
```

Apoi folosește CSS variables în stilurile tale:

```css
.button {
  background-color: var(--color-primary-600);
  color: var(--color-text-primary);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
}
```

## Variabile CSS Disponibile

### Culori
- `--color-primary-*` - Culori principale (50-950)
- `--color-secondary-*` - Culori secundare (50-950)
- `--color-success-*` - Culori success (light, DEFAULT, dark)
- `--color-error-*` - Culori error (light, DEFAULT, dark)
- `--color-warning-*` - Culori warning (light, DEFAULT, dark)
- `--color-info-*` - Culori info (light, DEFAULT, dark)
- `--color-background` - Background principal
- `--color-text-primary` - Text principal
- `--color-text-secondary` - Text secundar
- `--color-border` - Border

### Tipografie
- `--font-family-sans` - Font family sans-serif
- `--font-family-mono` - Font family monospace
- `--font-size-base` - Dimensiune font de bază
- `--font-size-label` - Dimensiune font label
- `--font-size-display` - Dimensiune font display

### Spațiere
- `--spacing-1` până la `--spacing-8` - Scala de spațiere

### Umbre
- `--shadow-sm` - Umbră mică
- `--shadow-md` - Umbră medie
- `--shadow-lg` - Umbră mare
- `--shadow-xl` - Umbră extra mare
- `--shadow-colored-primary` - Umbră colorată primary

### Borduri
- `--border-radius-sm` - Border radius mic
- `--border-radius-md` - Border radius mediu
- `--border-radius-lg` - Border radius mare
- `--border-width` - Lățime border

### Tranziții
- `--transition-default` - Tranziție default
- `--transition-colors` - Tranziție culori

## Dark Mode

Pentru dark mode, adaugă clasa `dark` la elementul root:

```html
<html class="dark">
  <!-- content -->
</html>
```

Sau folosește media query:

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* dark theme variables */
  }
}
```

Pentru mai multe detalii, vezi [Ghid Integrare](../docs/integration-guide.md).

