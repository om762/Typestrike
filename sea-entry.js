/**
 * TypeStrike — Single-file entry point for SEA bundling
 * This file imports the App and launches it, serving as the true entry point.
 */
import { App } from './src/app.js';

// Check if running in a TTY
if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error('TypeStrike must be run in an interactive terminal (TTY).');
  process.exit(1);
}

// Launch the app
const app = new App();
app.start().catch((err) => {
  process.stdout.write('\x1b[?1049l');
  process.stdout.write('\x1b[?25h');
  console.error('TypeStrike crashed:', err);
  process.exit(1);
});
