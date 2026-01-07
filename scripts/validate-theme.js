#!/usr/bin/env node

/**
 * Theme Validation Script
 * 
 * Validates that portable theme files are in sync with source design system tokens.
 * 
 * Validates:
 * - JSON syntax validity
 * - Version consistency between JSON and TypeScript files
 * - Presence of all required keys (colors, typography, spacing, etc.)
 * - Correctness of color values (primary, secondary)
 * - Breakpoint values
 * - FontSize structure
 * 
 * @usage
 *   node scripts/validate-theme.js
 * 
 * @exit 0 - All validations passed
 * @exit 1 - Validation failed (errors found)
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

let errors = 0;
let warnings = 0;
let successes = 0;

function log(message, type = 'info') {
  const prefix = type === 'error' ? `${colors.red}✗` : type === 'warning' ? `${colors.yellow}⚠` : `${colors.green}✓`;
  console.log(`${prefix} ${message}${colors.reset}`);
}

function error(message) {
  errors++;
  log(message, 'error');
}

function warning(message) {
  warnings++;
  log(message, 'warning');
}

function success(message) {
  successes++;
  log(message, 'info');
}

// Load files
const rootDir = path.join(__dirname, '..');
const jsonThemePath = path.join(rootDir, 'design-system-theme.json');
const tsThemePath = path.join(rootDir, 'design-system-theme.ts');

console.log(`${colors.blue}Validating Theme Files...${colors.reset}\n`);

// 1. Check if files exist
if (!fs.existsSync(jsonThemePath)) {
  error(`JSON theme file not found: ${jsonThemePath}`);
  process.exit(1);
}
if (!fs.existsSync(tsThemePath)) {
  error(`TypeScript theme file not found: ${tsThemePath}`);
  process.exit(1);
}

success('Theme files exist');

// 2. Validate JSON syntax
let jsonTheme;
try {
  const jsonContent = fs.readFileSync(jsonThemePath, 'utf8');
  jsonTheme = JSON.parse(jsonContent);
  success('JSON file is valid');
} catch (e) {
  error(`JSON file is invalid: ${e.message}`);
  process.exit(1);
}

// 3. Check version consistency
const jsonVersion = jsonTheme.version;
if (!jsonVersion) {
  warning('JSON file missing version field');
} else {
  success(`JSON version: ${jsonVersion}`);
}

// Check TypeScript version
const tsContent = fs.readFileSync(tsThemePath, 'utf8');
const tsVersionMatch = tsContent.match(/export const THEME_VERSION = ['"]([^'"]+)['"]/);
if (!tsVersionMatch) {
  warning('TypeScript file missing THEME_VERSION export');
} else {
  const tsVersion = tsVersionMatch[1];
  success(`TypeScript version: ${tsVersion}`);
  
  if (jsonVersion && jsonVersion !== tsVersion) {
    error(`Version mismatch: JSON has ${jsonVersion}, TypeScript has ${tsVersion}`);
  } else if (jsonVersion && jsonVersion === tsVersion) {
    success('Versions match');
  }
}

// 4. Validate key structure consistency
const requiredKeys = [
  'colors',
  'typography',
  'spacing',
  'shadows',
  'borders',
  'transitions',
  'breakpoints',
  'zIndex',
  'themes',
];

for (const key of requiredKeys) {
  if (!jsonTheme[key]) {
    error(`Missing required key in JSON: ${key}`);
  } else {
    success(`Key present: ${key}`);
  }
}

// 5. Validate color values
if (jsonTheme.colors) {
  const primary600 = jsonTheme.colors.primary?.[600];
  const secondary500 = jsonTheme.colors.secondary?.[500];
  
  if (primary600 !== '#4f46e5') {
    error(`Primary 600 color mismatch: expected #4f46e5, got ${primary600}`);
  } else {
    success('Primary color values correct');
  }
  
  if (secondary500 !== '#14b8a6') {
    error(`Secondary 500 color mismatch: expected #14b8a6, got ${secondary500}`);
  } else {
    success('Secondary color values correct');
  }
}

// 6. Validate breakpoints
if (jsonTheme.breakpoints) {
  const expectedBreakpoints = {
    mobile: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  };
  
  for (const [key, value] of Object.entries(expectedBreakpoints)) {
    if (jsonTheme.breakpoints[key] !== value) {
      error(`Breakpoint ${key} mismatch: expected ${value}, got ${jsonTheme.breakpoints[key]}`);
    }
  }
  success('Breakpoints validated');
}

// 7. Check for common issues
if (jsonTheme.typography?.fontSize) {
  // Check if fontSize structure is consistent
  const fontSizeKeys = Object.keys(jsonTheme.typography.fontSize);
  const hasBase = fontSizeKeys.includes('base');
  if (!hasBase) {
    error('Missing fontSize.base');
  } else {
    const baseFontSize = jsonTheme.typography.fontSize.base;
    if (typeof baseFontSize === 'object' && baseFontSize.size) {
      // JSON format (flattened)
      if (baseFontSize.size !== '1rem') {
        error(`fontSize.base.size mismatch: expected 1rem, got ${baseFontSize.size}`);
      } else {
        success('FontSize structure validated');
      }
    } else {
      warning('fontSize.base structure unexpected format');
    }
  }
}

// Summary
console.log(`\n${colors.blue}Validation Summary:${colors.reset}`);
console.log(`${colors.green}✓ Successes: ${successes}${colors.reset}`);
if (warnings > 0) {
  console.log(`${colors.yellow}⚠ Warnings: ${warnings}${colors.reset}`);
}
if (errors > 0) {
  console.log(`${colors.red}✗ Errors: ${errors}${colors.reset}`);
  console.log(`\n${colors.red}Validation failed!${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}✓ All validations passed!${colors.reset}`);
  process.exit(0);
}


