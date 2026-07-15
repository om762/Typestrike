import { standardDeviation } from '../utils/helpers.js';

/**
 * Core typing test engine.
 * Manages target text, user input, character-level tracking, and statistics.
 */
export class TypingEngine {
  constructor(targetText) {
    this.targetText = targetText;
    this.typed = [];           // Array of { char, correct } for each typed character
    this.cursor = 0;           // Current position in targetText
    this.startTime = null;
    this.endTime = null;
    this.wpmSnapshots = [];    // Per-second WPM samples for consistency
    this.lastSnapshotTime = 0;
    this.finished = false;
  }

  /**
   * Process a single keypress.
   * Returns: { action: 'char'|'backspace'|'complete'|'ignore', correct?: boolean }
   */
  processKey(char) {
    if (this.finished) return { action: 'ignore' };

    // Start timer on first keypress
    if (this.startTime === null) {
      this.startTime = Date.now();
      this.lastSnapshotTime = this.startTime;
    }

    // Take WPM snapshot every second
    this._takeSnapshot();

    if (char === 'backspace') {
      return this._handleBackspace();
    }

    // Regular character
    if (this.cursor >= this.targetText.length) {
      return { action: 'ignore' };
    }

    const expected = this.targetText[this.cursor];
    const correct = char === expected;

    this.typed.push({ char, correct });
    this.cursor++;

    // Check if test is complete
    if (this.cursor >= this.targetText.length) {
      this.endTime = Date.now();
      this.finished = true;
      this._takeSnapshot();
      return { action: 'complete', correct };
    }

    return { action: 'char', correct };
  }

  _handleBackspace() {
    if (this.cursor <= 0) return { action: 'ignore' };
    this.cursor--;
    this.typed.pop();
    return { action: 'backspace' };
  }

  _takeSnapshot() {
    const now = Date.now();
    if (now - this.lastSnapshotTime >= 1000) {
      const stats = this.getStats();
      if (stats.wpm > 0) {
        this.wpmSnapshots.push(stats.wpm);
      }
      this.lastSnapshotTime = now;
    }
  }

  /**
   * Force-end the test (for timed mode)
   */
  forceEnd() {
    if (!this.finished) {
      this.endTime = Date.now();
      this.finished = true;
      this._takeSnapshot();
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    const elapsed = this._getElapsedSeconds();
    if (elapsed <= 0) {
      return {
        wpm: 0,
        rawWpm: 0,
        accuracy: 100,
        consistency: 100,
        correctChars: 0,
        incorrectChars: 0,
        totalChars: 0,
        elapsed: 0,
        progress: 0
      };
    }

    const correctChars = this.typed.filter(t => t.correct).length;
    const incorrectChars = this.typed.filter(t => !t.correct).length;
    const totalChars = this.typed.length;

    // Standard WPM: (characters / 5) / minutes
    const minutes = elapsed / 60;
    const rawWpm = Math.round((totalChars / 5) / minutes);
    const netWpm = Math.max(0, Math.round((correctChars / 5) / minutes));
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    // Consistency: inverse of coefficient of variation of WPM snapshots
    let consistency = 100;
    if (this.wpmSnapshots.length >= 2) {
      const mean = this.wpmSnapshots.reduce((a, b) => a + b, 0) / this.wpmSnapshots.length;
      const sd = standardDeviation(this.wpmSnapshots);
      if (mean > 0) {
        const cv = (sd / mean) * 100;
        consistency = Math.max(0, Math.round(100 - cv));
      }
    }

    const progress = this.targetText.length > 0
      ? Math.round((this.cursor / this.targetText.length) * 100)
      : 0;

    return {
      wpm: netWpm,
      rawWpm,
      accuracy,
      consistency,
      correctChars,
      incorrectChars,
      totalChars,
      elapsed: Math.round(elapsed),
      progress
    };
  }

  _getElapsedSeconds() {
    if (!this.startTime) return 0;
    const end = this.endTime || Date.now();
    return (end - this.startTime) / 1000;
  }

  /**
   * Get display data for rendering
   */
  getDisplayData() {
    return {
      targetText: this.targetText,
      typed: this.typed,
      cursor: this.cursor,
      finished: this.finished
    };
  }

  /**
   * Reset the engine with new text
   */
  reset(targetText) {
    this.targetText = targetText || this.targetText;
    this.typed = [];
    this.cursor = 0;
    this.startTime = null;
    this.endTime = null;
    this.wpmSnapshots = [];
    this.lastSnapshotTime = 0;
    this.finished = false;
  }

  /**
   * Check if the test has started
   */
  hasStarted() {
    return this.startTime !== null;
  }

  isComplete() {
    return this.finished;
  }
}
