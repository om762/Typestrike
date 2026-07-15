import { C, getSize, centerAnsi, renderFrame, drawDivider, progressBar, stripAnsi } from './renderer.js';

/**
 * Results screen — displays test stats in a beautiful card.
 */
export class ResultsScreen {
  constructor() {
    this.isNewBest = false;
    this.celebrationFrame = 0;
  }

  /**
   * Render the results screen
   */
  render(stats, config, isNewBest = false) {
    this.isNewBest = isNewBest;
    const { cols, rows } = getSize();
    const lines = [];
    const maxWidth = Math.min(cols - 4, 60);

    // Top padding
    const contentHeight = 26;
    const topPad = Math.max(1, Math.floor((rows - contentHeight) / 2));
    for (let i = 0; i < topPad; i++) {
      lines.push('');
    }

    // Title
    if (isNewBest) {
      this.celebrationFrame++;
      const sparkles = this.celebrationFrame % 2 === 0 ? '✨🏆✨' : '🏆✨🏆';
      lines.push(centerAnsi(
        `${C.trophy}${C.bold}${sparkles} NEW PERSONAL BEST! ${sparkles}${C.reset}`,
        cols
      ));
    } else {
      lines.push(centerAnsi(
        `${C.primary}${C.bold}━━━ Test Complete ━━━${C.reset}`,
        cols
      ));
    }
    lines.push('');

    // ─── WPM (big and prominent) ────────────────────────────────
    const wpmColor = stats.wpm >= 80 ? C.success : stats.wpm >= 50 ? C.accent : stats.wpm >= 30 ? C.warning : C.error;
    lines.push(centerAnsi(
      `${wpmColor}${C.bold}${stats.wpm}${C.reset} ${C.muted}wpm${C.reset}`,
      cols
    ));
    lines.push(centerAnsi(
      `${C.muted}raw: ${stats.rawWpm} wpm${C.reset}`,
      cols
    ));
    lines.push('');

    // ─── Stats Grid ─────────────────────────────────────────────
    lines.push(centerAnsi(drawDivider(maxWidth, C.muted), cols));
    lines.push('');

    // Accuracy
    const accColor = stats.accuracy >= 95 ? C.success : stats.accuracy >= 85 ? C.accent : stats.accuracy >= 70 ? C.warning : C.error;
    const accBar = progressBar(stats.accuracy, 100, 20, accColor, C.muted);
    lines.push(centerAnsi(
      `${C.white}Accuracy     ${accColor}${C.bold}${stats.accuracy}%${C.reset}  ${accBar}`,
      cols
    ));

    // Consistency
    const consColor = stats.consistency >= 80 ? C.success : stats.consistency >= 60 ? C.accent : C.warning;
    const consBar = progressBar(stats.consistency, 100, 20, consColor, C.muted);
    lines.push(centerAnsi(
      `${C.white}Consistency  ${consColor}${C.bold}${stats.consistency}%${C.reset}  ${consBar}`,
      cols
    ));

    lines.push('');
    lines.push(centerAnsi(drawDivider(maxWidth, C.muted), cols));
    lines.push('');

    // Character breakdown
    lines.push(centerAnsi(
      `${C.success}✓ ${stats.correctChars}${C.reset} ${C.muted}correct${C.reset}   ` +
      `${C.error}✗ ${stats.incorrectChars}${C.reset} ${C.muted}incorrect${C.reset}   ` +
      `${C.muted}⏱ ${stats.elapsed}s${C.reset}`,
      cols
    ));

    lines.push('');

    // Mode info
    let modeStr = '';
    if (config.mode === 'timed') {
      modeStr = `Timed ${config.duration}s`;
    } else if (config.mode === 'words') {
      modeStr = `${config.wordCount} words`;
    } else {
      modeStr = 'Quote';
    }
    if (config.mode !== 'quote') {
      modeStr += ` · ${config.difficulty}`;
    }
    lines.push(centerAnsi(
      `${C.muted}${modeStr}${C.reset}`,
      cols
    ));

    lines.push('');
    lines.push(centerAnsi(drawDivider(maxWidth, C.muted), cols));
    lines.push('');

    // Controls
    lines.push(centerAnsi(
      `${C.accent}Tab${C.reset} ${C.dim}restart${C.reset}   ${C.muted}Esc${C.reset} ${C.dim}menu${C.reset}`,
      cols
    ));

    return lines;
  }
}
