import { C, getColoredLogo, getSize, centerAnsi, renderFrame, drawDivider, drawBox } from './renderer.js';
import { getPersonalBest } from '../utils/history.js';

/**
 * Menu configuration
 */
const MENU_SECTIONS = [
  {
    key: 'mode',
    label: 'Test Mode',
    options: [
      { value: 'timed',  label: 'Timed',    desc: 'Race against the clock' },
      { value: 'words',  label: 'Words',     desc: 'Type a set number of words' },
      { value: 'quote',  label: 'Quote',     desc: 'Type a famous quote' },
    ]
  },
  {
    key: 'duration',
    label: 'Duration',
    options: [
      { value: 15,  label: '15s'  },
      { value: 30,  label: '30s'  },
      { value: 60,  label: '60s'  },
      { value: 120, label: '120s' },
    ],
    showWhen: (config) => config.mode === 'timed'
  },
  {
    key: 'wordCount',
    label: 'Word Count',
    options: [
      { value: 10,  label: '10'  },
      { value: 25,  label: '25'  },
      { value: 50,  label: '50'  },
      { value: 100, label: '100' },
    ],
    showWhen: (config) => config.mode === 'words'
  },
  {
    key: 'difficulty',
    label: 'Difficulty',
    options: [
      { value: 'easy',   label: 'Easy',   desc: 'Common short words' },
      { value: 'medium', label: 'Medium', desc: 'Standard vocabulary' },
      { value: 'hard',   label: 'Hard',   desc: 'Advanced + punctuation' },
      { value: 'code',   label: 'Code',   desc: 'Programming syntax' },
    ],
    showWhen: (config) => config.mode !== 'quote'
  }
];

const DEFAULT_CONFIG = {
  mode: 'timed',
  duration: 30,
  wordCount: 25,
  difficulty: 'medium'
};

/**
 * Interactive menu.
 * Arrow keys to navigate, Enter to select, Tab to start test.
 */
export class Menu {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.activeSection = 0; // Which section is focused
    this.animFrame = 0;
  }

  /**
   * Get the currently visible sections
   */
  _getVisibleSections() {
    return MENU_SECTIONS.filter(s => !s.showWhen || s.showWhen(this.config));
  }

  /**
   * Handle navigation
   */
  handleKey(event, data) {
    const visible = this._getVisibleSections();

    switch (event) {
      case 'up':
        this.activeSection = Math.max(0, this.activeSection - 1);
        break;
      case 'down':
        this.activeSection = Math.min(visible.length - 1, this.activeSection + 1);
        break;
      case 'left': {
        const section = visible[this.activeSection];
        if (!section) break;
        const currentIdx = section.options.findIndex(o => o.value === this.config[section.key]);
        const newIdx = Math.max(0, currentIdx - 1);
        this.config[section.key] = section.options[newIdx].value;
        break;
      }
      case 'right': {
        const section = visible[this.activeSection];
        if (!section) break;
        const currentIdx = section.options.findIndex(o => o.value === this.config[section.key]);
        const newIdx = Math.min(section.options.length - 1, currentIdx + 1);
        this.config[section.key] = section.options[newIdx].value;
        break;
      }
    }

    // Clamp section if visibility changed
    const newVisible = this._getVisibleSections();
    if (this.activeSection >= newVisible.length) {
      this.activeSection = newVisible.length - 1;
    }
  }

  /**
   * Get current config
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Render the menu and return lines array
   */
  render() {
    const { cols, rows } = getSize();
    const lines = [];
    const maxWidth = Math.min(cols - 4, 70);

    // Empty lines for top padding
    const logo = getColoredLogo();
    const contentHeight = logo.length + 2 + (this._getVisibleSections().length * 4) + 10;
    const topPad = Math.max(1, Math.floor((rows - contentHeight) / 2));

    for (let i = 0; i < topPad; i++) {
      lines.push('');
    }

    // Logo
    for (const line of logo) {
      lines.push(centerAnsi(line, cols));
    }

    // Tagline
    lines.push('');
    lines.push(centerAnsi(`${C.muted}⌨  A blazing-fast typing test for your terminal  ⌨${C.reset}`, cols));
    lines.push('');

    // Personal best
    const pb = getPersonalBest();
    if (pb) {
      lines.push(centerAnsi(
        `${C.trophy}★${C.reset} ${C.gold}Personal Best: ${pb.wpm} WPM${C.reset} ${C.muted}(${pb.accuracy}% accuracy)${C.reset} ${C.trophy}★${C.reset}`,
        cols
      ));
    } else {
      lines.push(centerAnsi(`${C.muted}No tests completed yet — be the first!${C.reset}`, cols));
    }
    lines.push('');
    lines.push(centerAnsi(drawDivider(maxWidth, C.muted), cols));
    lines.push('');

    // Menu sections
    const visible = this._getVisibleSections();
    for (let si = 0; si < visible.length; si++) {
      const section = visible[si];
      const isActive = si === this.activeSection;

      // Section label
      const labelColor = isActive ? C.accent : C.muted;
      const arrow = isActive ? `${C.accent}▸ ` : '  ';
      lines.push(centerAnsi(
        `${arrow}${labelColor}${C.bold}${section.label}${C.reset}`,
        cols
      ));

      // Options row
      let optionLine = '  ';
      for (const opt of section.options) {
        const isSelected = this.config[section.key] === opt.value;
        if (isSelected && isActive) {
          optionLine += `${C.bgSelected}${C.accent}${C.bold} ${opt.label} ${C.reset}  `;
        } else if (isSelected) {
          optionLine += `${C.primary} ${opt.label} ${C.reset}  `;
        } else {
          optionLine += `${C.muted} ${opt.label} ${C.reset}  `;
        }
      }
      lines.push(centerAnsi(optionLine, cols));

      // Description for selected option (if available)
      const selectedOpt = section.options.find(o => o.value === this.config[section.key]);
      if (selectedOpt && selectedOpt.desc && isActive) {
        lines.push(centerAnsi(`${C.dim}${C.muted}${selectedOpt.desc}${C.reset}`, cols));
      } else {
        lines.push('');
      }

      lines.push('');
    }

    // Divider
    lines.push(centerAnsi(drawDivider(maxWidth, C.muted), cols));
    lines.push('');

    // Controls
    lines.push(centerAnsi(
      `${C.muted}↑↓${C.reset} ${C.dim}navigate${C.reset}   ${C.muted}←→${C.reset} ${C.dim}select${C.reset}   ${C.accent}Enter${C.reset} ${C.dim}start${C.reset}   ${C.muted}Esc${C.reset} ${C.dim}quit${C.reset}`,
      cols
    ));

    // Version info at bottom
    lines.push('');
    lines.push(centerAnsi(`${C.muted}TypeStrike v1.0.0${C.reset}`, cols));

    return lines;
  }
}
