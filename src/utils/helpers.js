import { wordsEasy } from '../data/words-easy.js';
import { wordsMedium } from '../data/words-medium.js';
import { wordsHard } from '../data/words-hard.js';
import { wordsCode } from '../data/words-code.js';
import { quotes } from '../data/quotes.js';

/**
 * Get current terminal dimensions
 */
export function getTerminalSize() {
  return {
    cols: process.stdout.columns || 80,
    rows: process.stdout.rows || 24
  };
}

/**
 * Word-wrap text to fit within a given width.
 * Returns an array of lines.
 */
export function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Format seconds into MM:SS or just SS display
 */
export function formatTime(seconds) {
  if (seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `${secs}s`;
}

/**
 * Shuffle an array using Fisher-Yates
 */
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Get word list by difficulty
 */
export function getWordList(difficulty) {
  switch (difficulty) {
    case 'easy': return wordsEasy;
    case 'medium': return wordsMedium;
    case 'hard': return wordsHard;
    case 'code': return wordsCode;
    default: return wordsMedium;
  }
}

/**
 * Generate random text from a word list
 */
export function generateText(difficulty, wordCount) {
  const wordList = getWordList(difficulty);
  const words = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(wordList[Math.floor(Math.random() * wordList.length)]);
  }
  return words.join(' ');
}

/**
 * Get a random quote
 */
export function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Center a string within a given width
 */
export function centerText(text, width) {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
}

/**
 * Pad right
 */
export function padRight(text, width) {
  if (text.length >= width) return text.substring(0, width);
  return text + ' '.repeat(width - text.length);
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Clamp a number between min and max
 */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Sleep for ms milliseconds (async)
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
