import { TypingEngine } from './core/engine.js';
import { InputHandler } from './core/input.js';
import { CountdownTimer } from './core/timer.js';
import { Menu } from './ui/menu.js';
import { showCountdown } from './ui/countdown.js';
import { ResultsScreen } from './ui/results.js';
import {
  C, clearScreen, hideCursor, showCursor, renderFrame,
  enableAltScreen, disableAltScreen, getSize, centerAnsi,
  drawDivider, progressBar, stripAnsi
} from './ui/renderer.js';
import { generateText, getRandomQuote, formatTime } from './utils/helpers.js';
import { saveResult, getPersonalBest } from './utils/history.js';

/**
 * Application states
 */
const STATE = {
  MENU: 'menu',
  COUNTDOWN: 'countdown',
  TYPING: 'typing',
  RESULTS: 'results'
};

/**
 * Main application orchestrator.
 * Manages the state machine: MENU → COUNTDOWN → TYPING → RESULTS → MENU
 */
export class App {
  constructor() {
    this.state = STATE.MENU;
    this.input = new InputHandler();
    this.menu = new Menu();
    this.results = new ResultsScreen();
    this.engine = null;
    this.timer = null;
    this.config = null;
    this.renderInterval = null;
    this.isNewBest = false;
    this.quoteAuthor = null;
  }

  /**
   * Start the application
   */
  async start() {
    // Setup clean exit
    process.on('exit', () => this._cleanup());
    process.on('SIGINT', () => { this._cleanup(); process.exit(0); });
    process.on('SIGTERM', () => { this._cleanup(); process.exit(0); });

    // Handle terminal resize
    process.stdout.on('resize', () => this._onResize());

    // Enter alt screen buffer
    enableAltScreen();
    hideCursor();
    clearScreen();

    // Start input handling
    this.input.start();
    this._bindMenuKeys();

    // Initial render
    this._renderMenu();
  }

  // ─── State Transitions ──────────────────────────────────────────────────

  _transitionToMenu() {
    this.state = STATE.MENU;
    this._stopRenderLoop();
    if (this.timer) {
      this.timer.stop();
      this.timer = null;
    }
    this.engine = null;
    this.input.off();
    this._bindMenuKeys();
    clearScreen();
    this._renderMenu();
  }

  async _transitionToCountdown() {
    this.state = STATE.COUNTDOWN;
    this.config = this.menu.getConfig();
    this.input.off();
    clearScreen();

    await showCountdown();

    this._transitionToTyping();
  }

  _transitionToTyping() {
    this.state = STATE.TYPING;

    // Generate target text
    let targetText;
    if (this.config.mode === 'quote') {
      const quote = getRandomQuote();
      targetText = quote.text;
      this.quoteAuthor = quote.author;
    } else {
      const wordCount = this.config.mode === 'words'
        ? this.config.wordCount
        : this._getWordCountForDuration(this.config.duration);
      targetText = generateText(this.config.difficulty, wordCount);
      this.quoteAuthor = null;
    }

    // Create engine
    this.engine = new TypingEngine(targetText);

    // Setup timer for timed mode
    if (this.config.mode === 'timed') {
      this.timer = new CountdownTimer(this.config.duration);
      this.timer.onEnd(() => {
        this.engine.forceEnd();
        this._transitionToResults();
      });
    }

    // Bind typing keys
    this.input.off();
    this._bindTypingKeys();

    // Start render loop
    clearScreen();
    this._startRenderLoop();
  }

  _transitionToResults() {
    this.state = STATE.RESULTS;
    this._stopRenderLoop();
    if (this.timer) {
      this.timer.stop();
    }

    // Get final stats
    const stats = this.engine.getStats();

    // Save to history
    this.isNewBest = saveResult({
      ...stats,
      mode: this.config.mode,
      difficulty: this.config.difficulty || 'quote',
      duration: this.config.mode === 'timed' ? this.config.duration : stats.elapsed
    });

    // Bind results keys
    this.input.off();
    this._bindResultsKeys();

    // Render results
    clearScreen();
    const lines = this.results.render(stats, this.config, this.isNewBest);
    renderFrame(lines);
  }

  // ─── Key Bindings ────────────────────────────────────────────────────────

  _bindMenuKeys() {
    this.input
      .on('up', () => {
        this.menu.handleKey('up');
        this._renderMenu();
      })
      .on('down', () => {
        this.menu.handleKey('down');
        this._renderMenu();
      })
      .on('left', () => {
        this.menu.handleKey('left');
        this._renderMenu();
      })
      .on('right', () => {
        this.menu.handleKey('right');
        this._renderMenu();
      })
      .on('enter', () => {
        this._transitionToCountdown();
      })
      .on('escape', () => {
        this._cleanup();
        process.exit(0);
      });
  }

  _bindTypingKeys() {
    this.input
      .on('char', (char) => {
        // Start timer on first keypress (timed mode)
        if (this.config.mode === 'timed' && this.timer && !this.timer.isRunning()) {
          this.timer.start();
        }

        const result = this.engine.processKey(char);
        if (result.action === 'complete') {
          this._transitionToResults();
        }
      })
      .on('backspace', () => {
        this.engine.processKey('backspace');
      })
      .on('tab', () => {
        // Restart with same config
        this._transitionToTyping();
      })
      .on('escape', () => {
        this._transitionToMenu();
      });
  }

  _bindResultsKeys() {
    this.input
      .on('tab', () => {
        this._transitionToTyping();
      })
      .on('enter', () => {
        this._transitionToTyping();
      })
      .on('escape', () => {
        this._transitionToMenu();
      });
  }

  // ─── Rendering ───────────────────────────────────────────────────────────

  _renderMenu() {
    const lines = this.menu.render();
    renderFrame(lines);
  }

  _renderTypingScreen() {
    if (this.state !== STATE.TYPING || !this.engine) return;

    const { cols, rows } = getSize();
    const lines = [];
    const maxWidth = Math.min(cols - 8, 75);
    const display = this.engine.getDisplayData();
    const stats = this.engine.getStats();

    // ─── Top Bar: Stats ──────────────────────────────────────
    lines.push('');

    // Timer or progress
    let statusLeft = '';
    if (this.config.mode === 'timed' && this.timer) {
      const remaining = this.timer.getRemaining();
      const timerColor = remaining <= 5 ? C.error : remaining <= 10 ? C.warning : C.primary;
      statusLeft = `${timerColor}${C.bold}${formatTime(remaining)}${C.reset}`;
    } else {
      statusLeft = `${C.muted}${stats.progress}%${C.reset}`;
    }

    // WPM and accuracy
    const wpmColor = stats.wpm >= 80 ? C.success : stats.wpm >= 50 ? C.accent : stats.wpm >= 30 ? C.warning : C.muted;
    const statusRight = `${wpmColor}${C.bold}${stats.wpm}${C.reset} ${C.muted}wpm${C.reset}  ${C.muted}${stats.accuracy}% acc${C.reset}`;

    // Build status bar
    const statusLeftLen = stripAnsi(statusLeft).length;
    const statusRightLen = stripAnsi(statusRight).length;
    const statusGap = Math.max(1, maxWidth - statusLeftLen - statusRightLen);
    const statusBar = `${statusLeft}${' '.repeat(statusGap)}${statusRight}`;

    const leftPad = Math.max(0, Math.floor((cols - maxWidth) / 2));
    lines.push(' '.repeat(leftPad) + statusBar);

    // Progress bar
    if (this.config.mode !== 'timed') {
      lines.push(' '.repeat(leftPad) + progressBar(stats.progress, 100, maxWidth, C.accent, C.muted));
    } else if (this.timer) {
      const elapsed = this.config.duration - this.timer.getRemaining();
      lines.push(' '.repeat(leftPad) + progressBar(elapsed, this.config.duration, maxWidth, C.primary, C.muted));
    } else {
      lines.push('');
    }

    lines.push('');
    lines.push(' '.repeat(leftPad) + drawDivider(maxWidth, C.muted));
    lines.push('');

    // ─── Text Display Area ───────────────────────────────────
    // Render character-by-character with proper word-wrapping
    const text = display.targetText;
    let renderedLine = '';
    let lineLen = 0;

    for (let gi = 0; gi < text.length; gi++) {
      const ch = text[gi];

      // Word-wrap: if adding the next word would overflow, break here
      if (ch === ' ' && lineLen > 0) {
        // Look ahead to see next word length
        let nextWordLen = 0;
        for (let j = gi + 1; j < text.length && text[j] !== ' '; j++) {
          nextWordLen++;
        }
        if (lineLen + 1 + nextWordLen > maxWidth && nextWordLen > 0) {
          // Break line — render the space as typed but start a new visual line
          // Color the space character
          if (gi < display.cursor) {
            const typedInfo = display.typed[gi];
            if (typedInfo && typedInfo.correct) {
              renderedLine += `${C.correct} ${C.reset}`;
            } else {
              renderedLine += `${C.incorrectBg}${C.incorrect} ${C.reset}`;
            }
          } else if (gi === display.cursor) {
            renderedLine += `${C.cursorBg}${C.cursor} ${C.reset}`;
          } else {
            renderedLine += `${C.upcoming} ${C.reset}`;
          }
          lines.push(' '.repeat(leftPad) + renderedLine);
          renderedLine = '';
          lineLen = 0;
          continue;
        }
      }

      // Color the character based on typing state
      if (gi < display.cursor) {
        const typedInfo = display.typed[gi];
        if (typedInfo && typedInfo.correct) {
          renderedLine += `${C.correct}${ch}${C.reset}`;
        } else {
          renderedLine += `${C.incorrectBg}${C.incorrect}${C.bold}${ch}${C.reset}`;
        }
      } else if (gi === display.cursor) {
        renderedLine += `${C.cursorBg}${C.cursor}${ch}${C.reset}`;
      } else {
        renderedLine += `${C.upcoming}${ch}${C.reset}`;
      }
      lineLen++;
    }

    // Push last line
    if (renderedLine.length > 0) {
      lines.push(' '.repeat(leftPad) + renderedLine);
    }

    // ─── Quote Attribution ───────────────────────────────────
    if (this.quoteAuthor) {
      lines.push('');
      lines.push(' '.repeat(leftPad) + `${C.muted}${C.italic}— ${this.quoteAuthor}${C.reset}`);
    }

    // ─── Bottom Controls ─────────────────────────────────────
    // Push to bottom area
    const bottomPad = Math.max(1, rows - lines.length - 3);
    for (let i = 0; i < bottomPad; i++) {
      lines.push('');
    }

    lines.push(' '.repeat(leftPad) + drawDivider(maxWidth, C.muted));
    lines.push(' '.repeat(leftPad) +
      `${C.muted}Tab${C.reset} ${C.dim}restart${C.reset}   ${C.muted}Esc${C.reset} ${C.dim}menu${C.reset}`
    );

    renderFrame(lines);
  }

  _startRenderLoop() {
    // Render immediately
    this._renderTypingScreen();

    // Then update at ~30fps for smooth stats
    this.renderInterval = setInterval(() => {
      if (this.state === STATE.TYPING) {
        this._renderTypingScreen();
      }
    }, 33);
  }

  _stopRenderLoop() {
    if (this.renderInterval) {
      clearInterval(this.renderInterval);
      this.renderInterval = null;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Estimate word count needed for a given duration
   * (assuming ~50 WPM, generate extra to be safe)
   */
  _getWordCountForDuration(seconds) {
    const estimatedWpm = 70; // Generate for fast typists
    return Math.ceil((estimatedWpm * seconds) / 60) + 10;
  }

  _onResize() {
    clearScreen();
    switch (this.state) {
      case STATE.MENU:
        this._renderMenu();
        break;
      case STATE.TYPING:
        this._renderTypingScreen();
        break;
      case STATE.RESULTS:
        const stats = this.engine ? this.engine.getStats() : {};
        const resultLines = this.results.render(stats, this.config, this.isNewBest);
        renderFrame(resultLines);
        break;
    }
  }

  _cleanup() {
    this._stopRenderLoop();
    if (this.timer) this.timer.stop();
    this.input.stop();
    showCursor();
    disableAltScreen();
  }
}
