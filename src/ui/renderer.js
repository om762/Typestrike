/**
 * ANSI rendering engine.
 * Provides low-level terminal control: colors, cursor, screen management,
 * box drawing, and double-buffered frame rendering.
 */

// ─── Color Palette ──────────────────────────────────────────────────────────
export const C = {
  // Reset
  reset:       '\x1b[0m',

  // Text styles
  bold:        '\x1b[1m',
  dim:         '\x1b[2m',
  italic:      '\x1b[3m',
  underline:   '\x1b[4m',
  blink:       '\x1b[5m',
  inverse:     '\x1b[7m',
  strikethrough: '\x1b[9m',

  // Typing feedback colors
  correct:     '\x1b[38;5;82m',        // Bright green
  incorrect:   '\x1b[38;5;196m',       // Bright red
  incorrectBg: '\x1b[48;5;52m',        // Dark red background
  upcoming:    '\x1b[38;5;242m',       // Dim gray
  cursor:      '\x1b[4m\x1b[38;5;255m', // Underline + bright white
  cursorBg:    '\x1b[48;5;238m',       // Subtle dark background

  // UI colors
  primary:     '\x1b[38;5;75m',        // Soft blue
  accent:      '\x1b[38;5;214m',       // Warm orange
  success:     '\x1b[38;5;82m',        // Green
  warning:     '\x1b[38;5;220m',       // Yellow
  error:       '\x1b[38;5;196m',       // Red
  muted:       '\x1b[38;5;240m',       // Dark gray
  white:       '\x1b[38;5;255m',       // Bright white
  brightWhite: '\x1b[1m\x1b[38;5;255m',

  // Gradient colors for logo
  grad1:       '\x1b[38;5;39m',        // Deep blue
  grad2:       '\x1b[38;5;75m',        // Medium blue
  grad3:       '\x1b[38;5;111m',       // Light blue
  grad4:       '\x1b[38;5;147m',       // Periwinkle
  grad5:       '\x1b[38;5;183m',       // Lavender

  // Background
  bgDark:      '\x1b[48;5;234m',       // Very dark gray bg
  bgHighlight: '\x1b[48;5;236m',       // Slightly lighter
  bgSelected:  '\x1b[48;5;238m',       // Selected item

  // Special
  gold:        '\x1b[38;5;220m',       // Gold for personal best
  trophy:      '\x1b[38;5;226m',       // Bright yellow for trophy
};

// ─── Cursor & Screen Control ────────────────────────────────────────────────

export function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[3J\x1b[H');
}

export function moveTo(row, col) {
  process.stdout.write(`\x1b[${row};${col}H`);
}

export function hideCursor() {
  process.stdout.write('\x1b[?25l');
}

export function showCursor() {
  process.stdout.write('\x1b[?25h');
}

export function enableAltScreen() {
  process.stdout.write('\x1b[?1049h');
}

export function disableAltScreen() {
  process.stdout.write('\x1b[?1049l');
}

// ─── Box Drawing ────────────────────────────────────────────────────────────

const BOX = {
  topLeft:     '╭',
  topRight:    '╮',
  bottomLeft:  '╰',
  bottomRight: '╯',
  horizontal:  '─',
  vertical:    '│',
  teeLeft:     '├',
  teeRight:    '┤',
  cross:       '┼',
};

/**
 * Draw a box with optional title
 */
export function drawBox(width, height, title = '') {
  const lines = [];
  const innerWidth = width - 2;

  // Top border
  let top = BOX.topLeft;
  if (title) {
    const titleStr = ` ${title} `;
    const remaining = innerWidth - titleStr.length;
    const leftPad = Math.floor(remaining / 2);
    const rightPad = remaining - leftPad;
    top += BOX.horizontal.repeat(leftPad) + `${C.accent}${titleStr}${C.primary}` + BOX.horizontal.repeat(rightPad);
  } else {
    top += BOX.horizontal.repeat(innerWidth);
  }
  top += BOX.topRight;
  lines.push(`${C.primary}${top}${C.reset}`);

  // Middle rows
  for (let i = 0; i < height - 2; i++) {
    lines.push(`${C.primary}${BOX.vertical}${C.reset}${' '.repeat(innerWidth)}${C.primary}${BOX.vertical}${C.reset}`);
  }

  // Bottom border
  const bottom = BOX.bottomLeft + BOX.horizontal.repeat(innerWidth) + BOX.bottomRight;
  lines.push(`${C.primary}${bottom}${C.reset}`);

  return lines;
}

/**
 * Draw a horizontal divider
 */
export function drawDivider(width, color = C.muted) {
  return `${color}${BOX.horizontal.repeat(width)}${C.reset}`;
}

/**
 * Draw a separator with tees on each side
 */
export function drawSeparator(width) {
  return `${C.primary}${BOX.teeLeft}${BOX.horizontal.repeat(width - 2)}${BOX.teeRight}${C.reset}`;
}

// ─── Frame Rendering ────────────────────────────────────────────────────────

/**
 * Render a complete frame to the terminal.
 * Uses double-buffering: builds the entire screen as a string, then writes once.
 */
export function renderFrame(lines) {
  let frame = '\x1b[H'; // Move to top-left

  const { rows } = getSize();

  for (let i = 0; i < rows; i++) {
    if (i < lines.length) {
      frame += lines[i];
    }
    // Clear rest of line and move to next
    frame += '\x1b[K';
    if (i < rows - 1) {
      frame += '\n';
    }
  }

  process.stdout.write(frame);
}

/**
 * Get terminal size
 */
export function getSize() {
  return {
    cols: process.stdout.columns || 80,
    rows: process.stdout.rows || 24
  };
}

// ─── Text Utilities ─────────────────────────────────────────────────────────

/**
 * Strip ANSI codes from a string (for length calculation)
 */
export function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Center a string with ANSI codes within a width
 */
export function centerAnsi(str, width) {
  const visibleLen = stripAnsi(str).length;
  const padding = Math.max(0, Math.floor((width - visibleLen) / 2));
  return ' '.repeat(padding) + str;
}

/**
 * Right-align a string with ANSI codes within a width
 */
export function rightAlignAnsi(str, width) {
  const visibleLen = stripAnsi(str).length;
  const padding = Math.max(0, width - visibleLen);
  return ' '.repeat(padding) + str;
}

/**
 * Create a progress bar
 */
export function progressBar(value, max, width, filledColor = C.accent, emptyColor = C.muted) {
  const ratio = Math.min(1, Math.max(0, value / max));
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  return `${filledColor}${'━'.repeat(filled)}${emptyColor}${'━'.repeat(empty)}${C.reset}`;
}

// ─── ASCII Art ──────────────────────────────────────────────────────────────

export const LOGO = [
  '╺┳╸╻ ╻┏━┓┏━╸┏━┓╺┳╸┏━┓╻╻┏ ┏━╸',
  ' ┃ ┗┳┛┣━┛┣╸ ┗━┓ ┃ ┣┳┛┃┣┻┓┣╸ ',
  ' ╹  ╹ ╹  ┗━╸┗━┛ ╹ ╹┗╸╹╹ ╹┗━╸',
];

export const LOGO_COLORS = [C.grad1, C.grad2, C.grad3];

/**
 * Get colored logo lines
 */
export function getColoredLogo() {
  return LOGO.map((line, i) => `${LOGO_COLORS[i]}${line}${C.reset}`);
}

// ─── Big Numbers for Countdown ──────────────────────────────────────────────

const BIG_NUMBERS = {
  '3': [
    ' ██████╗ ',
    ' ╚════██╗',
    '  █████╔╝',
    '  ╚═══██╗',
    ' ██████╔╝',
    ' ╚═════╝ ',
  ],
  '2': [
    ' ██████╗ ',
    ' ╚════██╗',
    '  █████╔╝',
    ' ██╔═══╝ ',
    ' ███████╗',
    ' ╚══════╝',
  ],
  '1': [
    '    ██╗   ',
    '   ███║   ',
    '   ╚██║   ',
    '    ██║   ',
    '    ██║   ',
    '    ╚═╝   ',
  ],
  'GO': [
    '  ██████╗  ██████╗ ██╗',
    ' ██╔════╝ ██╔═══██╗██║',
    ' ██║  ███╗██║   ██║██║',
    ' ██║   ██║██║   ██║╚═╝',
    ' ╚██████╔╝╚██████╔╝██╗',
    '  ╚═════╝  ╚═════╝ ╚═╝',
  ]
};

export function getBigNumber(num) {
  return BIG_NUMBERS[num.toString()] || BIG_NUMBERS['1'];
}
