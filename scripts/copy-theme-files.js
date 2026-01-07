#!/usr/bin/env node

/**
 * Theme Files Copy Script
 * 
 * Automates copying theme files from source locations to the theme/ folder.
 * This script synchronizes files from the root directory and src/design-system/
 * to the portable theme/ folder structure.
 * 
 * @usage
 *   node scripts/copy-theme-files.js
 * 
 * @exit 0 - Copy successful
 * @exit 1 - Copy failed (errors found)
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

const rootDir = path.join(__dirname, '..');
let copied = 0;
let skipped = 0;
let errors = 0;

// File mapping: [source, destination]
const filesToCopy = [
  // Token files from root
  ['design-system-theme.json', 'theme/tokens/theme.json'],
  ['design-system-theme.ts', 'theme/tokens/theme.ts'],
  ['design-system-theme.schema.json', 'theme/tokens/schema.json'],
  
  // Style files from src/design-system/styles/
  ['src/design-system/styles/base.css', 'theme/styles/base.css'],
  ['src/design-system/styles/components.css', 'theme/styles/components.css'],
  ['src/design-system/styles/utilities.css', 'theme/styles/utilities.css'],
  ['src/design-system/styles/themes.css', 'theme/styles/themes.css'],
];

console.log(`${colors.blue}Copying Theme Files...${colors.reset}\n`);

// Copy files
for (const [source, destination] of filesToCopy) {
  const sourcePath = path.join(rootDir, source);
  const destPath = path.join(rootDir, destination);
  
  // Check if source exists
  if (!fs.existsSync(sourcePath)) {
    log(`Source file not found: ${source}`, 'warning');
    skipped++;
    continue;
  }
  
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      log(`Created directory: ${destDir}`);
    }
    
    // Copy file
    fs.copyFileSync(sourcePath, destPath);
    log(`Copied: ${source} → ${destination}`);
    copied++;
  } catch (e) {
    log(`Failed to copy ${source}: ${e.message}`, 'error');
    errors++;
  }
}

// Summary
console.log(`\n${colors.blue}Copy Summary:${colors.reset}`);
console.log(`${colors.green}✓ Copied: ${copied}${colors.reset}`);
if (skipped > 0) {
  console.log(`${colors.yellow}⚠ Skipped: ${skipped}${colors.reset}`);
}
if (errors > 0) {
  console.log(`${colors.red}✗ Errors: ${errors}${colors.reset}`);
  console.log(`\n${colors.red}Copy failed!${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}✓ All files copied successfully!${colors.reset}`);
  process.exit(0);
}

