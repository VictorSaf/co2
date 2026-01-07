#!/usr/bin/env node

/**
 * CSS Variables Generation Script
 * 
 * Generates CSS custom properties (CSS variables) from theme.json.
 * This script reads theme/tokens/theme.json and generates theme/configs/css-variables.css.
 * 
 * @usage
 *   node scripts/generate-css-variables.js
 * 
 * @exit 0 - Generation successful
 * @exit 1 - Generation failed (errors found)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, type = 'info') {
  const prefix = type === 'error' ? `${colors.red}✗` : type === 'warning' ? `${colors.yellow}⚠` : `${colors.green}✓`;
  console.log(`${prefix} ${message}${colors.reset}`);
}

// Paths
const rootDir = path.join(__dirname, '..');
const themeJsonPath = path.join(rootDir, 'theme', 'tokens', 'theme.json');
const outputPath = path.join(rootDir, 'theme', 'configs', 'css-variables.css');

console.log(`${colors.blue}Generating CSS Variables...${colors.reset}\n`);

// 1. Check if theme.json exists
if (!fs.existsSync(themeJsonPath)) {
  log(`Theme JSON file not found: ${themeJsonPath}`, 'error');
  process.exit(1);
}

// 2. Load theme.json
let theme;
try {
  const jsonContent = fs.readFileSync(themeJsonPath, 'utf8');
  theme = JSON.parse(jsonContent);
  log('Theme JSON loaded successfully');
} catch (e) {
  log(`Failed to parse theme JSON: ${e.message}`, 'error');
  process.exit(1);
}

// 3. Generate CSS variables
function toKebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function generateCSSVariables(obj, prefix = '') {
  let css = '';
  
  for (const [key, value] of Object.entries(obj)) {
    const cssKey = prefix ? `${prefix}-${toKebabCase(key)}` : toKebabCase(key);
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Handle special cases
      if (key === 'fontSize' && typeof value.size === 'string') {
        // FontSize has nested structure with size, lineHeight, letterSpacing
        css += `  --font-size-${toKebabCase(key)}: ${value.size};\n`;
        if (value.lineHeight) {
          css += `  --line-height-${toKebabCase(key)}: ${value.lineHeight};\n`;
        }
        if (value.letterSpacing) {
          css += `  --letter-spacing-${toKebabCase(key)}: ${value.letterSpacing};\n`;
        }
      } else if (key === 'fontFamily' && Array.isArray(value)) {
        // FontFamily is an array
        css += `  --font-family-${toKebabCase(key)}: ${value.join(', ')};\n`;
      } else {
        // Recursive for nested objects
        css += generateCSSVariables(value, cssKey);
      }
    } else if (typeof value === 'string' || typeof value === 'number') {
      // Handle DEFAULT key specially
      if (key === 'DEFAULT') {
        const baseKey = prefix.split('-').pop();
        css += `  --color-${baseKey}: ${value};\n`;
      } else {
        css += `  --${cssKey}: ${value};\n`;
      }
    }
  }
  
  return css;
}

// Generate CSS content
let cssContent = `/**
 * CSS Variables Generated from Theme Tokens
 * 
 * This file contains CSS custom properties generated from theme.json.
 * It can be used independently of Tailwind CSS.
 * 
 * To regenerate this file, run:
 * node scripts/generate-css-variables.js
 * 
 * Generated: ${new Date().toISOString()}
 */

:root {
  /* Colors - Primary */
`;

// Generate colors
if (theme.colors) {
  // Primary colors
  if (theme.colors.primary) {
    for (const [key, value] of Object.entries(theme.colors.primary)) {
      cssContent += `  --color-primary-${key}: ${value};\n`;
    }
  }
  
  cssContent += `  \n  /* Colors - Secondary */\n`;
  
  // Secondary colors
  if (theme.colors.secondary) {
    for (const [key, value] of Object.entries(theme.colors.secondary)) {
      cssContent += `  --color-secondary-${key}: ${value};\n`;
    }
  }
  
  cssContent += `  \n  /* Colors - Semantic */\n`;
  
  // Semantic colors
  if (theme.colors.semantic) {
    for (const [semanticKey, semanticValue] of Object.entries(theme.colors.semantic)) {
      if (typeof semanticValue === 'object') {
        for (const [key, value] of Object.entries(semanticValue)) {
          if (key === 'DEFAULT') {
            cssContent += `  --color-${semanticKey}: ${value};\n`;
          } else {
            cssContent += `  --color-${semanticKey}-${toKebabCase(key)}: ${value};\n`;
          }
        }
      }
    }
  }
  
  cssContent += `  \n  /* Colors - Neutral */\n`;
  
  // Neutral colors
  if (theme.colors.neutral) {
    for (const [key, value] of Object.entries(theme.colors.neutral)) {
      cssContent += `  --color-neutral-${key}: ${value};\n`;
    }
  }
  
  cssContent += `  \n  /* Colors - Functional */\n`;
  
  // Functional colors
  if (theme.colors.functional) {
    if (theme.colors.functional.background) {
      for (const [key, value] of Object.entries(theme.colors.functional.background)) {
        cssContent += `  --color-background-${toKebabCase(key)}: ${value};\n`;
      }
    }
    if (theme.colors.functional.text) {
      if (theme.colors.functional.text.primary) {
        for (const [key, value] of Object.entries(theme.colors.functional.text.primary)) {
          cssContent += `  --color-text-primary-${toKebabCase(key)}: ${value};\n`;
        }
      }
      if (theme.colors.functional.text.secondary) {
        for (const [key, value] of Object.entries(theme.colors.functional.text.secondary)) {
          cssContent += `  --color-text-secondary-${toKebabCase(key)}: ${value};\n`;
        }
      }
      if (theme.colors.functional.text.muted) {
        for (const [key, value] of Object.entries(theme.colors.functional.text.muted)) {
          cssContent += `  --color-text-muted-${toKebabCase(key)}: ${value};\n`;
        }
      }
    }
    if (theme.colors.functional.border) {
      for (const [key, value] of Object.entries(theme.colors.functional.border)) {
        cssContent += `  --color-border-${toKebabCase(key)}: ${value};\n`;
      }
    }
  }
}

// Typography
cssContent += `}\n\n:root {\n  /* Typography - Font Family */\n`;
if (theme.typography?.fontFamily) {
  if (theme.typography.fontFamily.sans) {
    cssContent += `  --font-family-sans: ${theme.typography.fontFamily.sans.join(', ')};\n`;
  }
  if (theme.typography.fontFamily.mono) {
    cssContent += `  --font-family-mono: ${theme.typography.fontFamily.mono.join(', ')};\n`;
  }
}

cssContent += `  \n  /* Typography - Font Size */\n`;
if (theme.typography?.fontSize) {
  for (const [key, value] of Object.entries(theme.typography.fontSize)) {
    if (typeof value === 'object' && value.size) {
      cssContent += `  --font-size-${toKebabCase(key)}: ${value.size};\n`;
      if (value.lineHeight) {
        cssContent += `  --line-height-${toKebabCase(key)}: ${value.lineHeight};\n`;
      }
      if (value.letterSpacing) {
        cssContent += `  --letter-spacing-${toKebabCase(key)}: ${value.letterSpacing};\n`;
      }
    }
  }
}

cssContent += `  \n  /* Typography - Font Weight */\n`;
if (theme.typography?.fontWeight) {
  for (const [key, value] of Object.entries(theme.typography.fontWeight)) {
    cssContent += `  --font-weight-${toKebabCase(key)}: ${value};\n`;
  }
}

// Spacing
cssContent += `}\n\n:root {\n  /* Spacing - Scale */\n`;
if (theme.spacing?.scale) {
  for (const [key, value] of Object.entries(theme.spacing.scale)) {
    cssContent += `  --spacing-${key}: ${value};\n`;
  }
}

cssContent += `  \n  /* Spacing - Semantic */\n`;
if (theme.spacing?.semantic) {
  for (const [key, value] of Object.entries(theme.spacing.semantic)) {
    cssContent += `  --spacing-${toKebabCase(key)}: ${value};\n`;
  }
}

cssContent += `  \n  /* Spacing - Component */\n`;
if (theme.spacing?.component) {
  if (theme.spacing.component.button) {
    for (const [key, value] of Object.entries(theme.spacing.component.button)) {
      cssContent += `  --spacing-button-${toKebabCase(key)}: ${value};\n`;
    }
  }
  if (theme.spacing.component.input) {
    for (const [key, value] of Object.entries(theme.spacing.component.input)) {
      cssContent += `  --spacing-input-${toKebabCase(key)}: ${value};\n`;
    }
  }
  if (theme.spacing.component.card) {
    for (const [key, value] of Object.entries(theme.spacing.component.card)) {
      cssContent += `  --spacing-card-${toKebabCase(key)}: ${value};\n`;
    }
  }
}

// Shadows
cssContent += `}\n\n:root {\n  /* Shadows - Standard */\n`;
if (theme.shadows?.standard) {
  for (const [key, value] of Object.entries(theme.shadows.standard)) {
    if (key === 'DEFAULT') {
      cssContent += `  --shadow: ${value};\n`;
    } else {
      cssContent += `  --shadow-${toKebabCase(key)}: ${value};\n`;
    }
  }
}

cssContent += `  \n  /* Shadows - Dark */\n`;
if (theme.shadows?.dark) {
  for (const [key, value] of Object.entries(theme.shadows.dark)) {
    cssContent += `  --shadow-dark-${toKebabCase(key)}: ${value};\n`;
  }
}

cssContent += `  \n  /* Shadows - Colored */\n`;
if (theme.shadows?.colored) {
  for (const [key, value] of Object.entries(theme.shadows.colored)) {
    cssContent += `  --shadow-colored-${toKebabCase(key)}: ${value};\n`;
  }
}

// Borders
cssContent += `}\n\n:root {\n  /* Borders - Radius */\n`;
if (theme.borders?.radius) {
  for (const [key, value] of Object.entries(theme.borders.radius)) {
    if (key === 'DEFAULT') {
      cssContent += `  --border-radius: ${value};\n`;
    } else {
      cssContent += `  --border-radius-${toKebabCase(key)}: ${value};\n`;
    }
  }
}

cssContent += `  \n  /* Borders - Width */\n`;
if (theme.borders?.width) {
  for (const [key, value] of Object.entries(theme.borders.width)) {
    cssContent += `  --border-width-${key}: ${value};\n`;
  }
}

cssContent += `  \n  /* Borders - Color */\n`;
if (theme.borders?.color) {
  for (const [key, value] of Object.entries(theme.borders.color)) {
    cssContent += `  --border-color-${toKebabCase(key)}: ${value};\n`;
  }
}

// Transitions
cssContent += `}\n\n:root {\n  /* Transitions - Duration */\n`;
if (theme.transitions?.duration) {
  for (const [key, value] of Object.entries(theme.transitions.duration)) {
    cssContent += `  --transition-duration-${key}: ${value};\n`;
  }
}

cssContent += `  \n  /* Transitions - Timing */\n`;
if (theme.transitions?.timing) {
  for (const [key, value] of Object.entries(theme.transitions.timing)) {
    cssContent += `  --transition-timing-${toKebabCase(key)}: ${value};\n`;
  }
}

cssContent += `  \n  /* Transitions - Preset */\n`;
if (theme.transitions?.preset) {
  for (const [key, value] of Object.entries(theme.transitions.preset)) {
    cssContent += `  --transition-${toKebabCase(key)}: ${value};\n`;
  }
}

// Breakpoints
cssContent += `}\n\n:root {\n  /* Breakpoints */\n`;
if (theme.breakpoints) {
  for (const [key, value] of Object.entries(theme.breakpoints)) {
    cssContent += `  --breakpoint-${toKebabCase(key)}: ${value};\n`;
  }
}

// Z-Index
cssContent += `}\n\n:root {\n  /* Z-Index - Scale */\n`;
if (theme.zIndex?.scale) {
  for (const [key, value] of Object.entries(theme.zIndex.scale)) {
    cssContent += `  --z-index-${key}: ${value};\n`;
  }
}

cssContent += `  \n  /* Z-Index - Semantic */\n`;
if (theme.zIndex?.semantic) {
  for (const [key, value] of Object.entries(theme.zIndex.semantic)) {
    cssContent += `  --z-index-${toKebabCase(key)}: ${value};\n`;
  }
}

// Dark theme overrides
cssContent += `}\n\n.dark {\n  /* Dark Theme Overrides */\n`;
if (theme.themes?.dark) {
  for (const [key, value] of Object.entries(theme.themes.dark)) {
    cssContent += `  --color-${toKebabCase(key)}: ${value};\n`;
  }
}
cssContent += `}\n`;

// 4. Write CSS file
try {
  // Ensure directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, cssContent, 'utf8');
  log(`CSS variables generated successfully: ${outputPath}`);
  console.log(`\n${colors.green}✓ Generation complete!${colors.reset}`);
  process.exit(0);
} catch (e) {
  log(`Failed to write CSS file: ${e.message}`, 'error');
  process.exit(1);
}

