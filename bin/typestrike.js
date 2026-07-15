#!/usr/bin/env node

/**
 * TypeStrike — A MonkeyType-inspired CLI typing test
 * ⌨  Beautiful, offline, zero dependencies  ⌨
 */

import { App } from '../src/app.js';

// Check Node.js version
const [major] = process.version.slice(1).split('.').map(Number);
if (major < 18) {
  console.error('TypeStrike requires Node.js >= 18.0.0');
  console.error(`Current version: ${process.version}`);
  process.exit(1);
}

// Check if running in a TTY
if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error('TypeStrike must be run in an interactive terminal (TTY).');
  process.exit(1);
}

// Launch the app
const app = new App();
app.start().catch((err) => {
  // Restore terminal on crash
  process.stdout.write('\x1b[?1049l'); // Disable alt screen
  process.stdout.write('\x1b[?25h');   // Show cursor
  console.error('TypeStrike crashed:', err);
  process.exit(1);
});
