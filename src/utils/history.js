import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.typestrike');
const HISTORY_FILE = path.join(CONFIG_DIR, 'history.json');
const MAX_HISTORY = 50;

/**
 * Ensure the config directory exists
 */
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Read test history from disk
 */
export function readHistory() {
  try {
    ensureConfigDir();
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // If file is corrupted, start fresh
  }
  return { tests: [], personalBest: null };
}

/**
 * Save a test result to history
 */
export function saveResult(result) {
  const history = readHistory();

  const entry = {
    date: new Date().toISOString(),
    wpm: result.wpm,
    rawWpm: result.rawWpm,
    accuracy: result.accuracy,
    consistency: result.consistency,
    mode: result.mode,
    difficulty: result.difficulty,
    duration: result.duration,
    correctChars: result.correctChars,
    incorrectChars: result.incorrectChars,
    totalChars: result.totalChars
  };

  history.tests.unshift(entry);

  // Trim to max history
  if (history.tests.length > MAX_HISTORY) {
    history.tests = history.tests.slice(0, MAX_HISTORY);
  }

  // Update personal best
  const isNewBest = !history.personalBest || result.wpm > history.personalBest.wpm;
  if (isNewBest) {
    history.personalBest = {
      wpm: result.wpm,
      accuracy: result.accuracy,
      date: entry.date,
      mode: result.mode,
      difficulty: result.difficulty
    };
  }

  try {
    ensureConfigDir();
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch {
    // Silently fail if we can't write
  }

  return isNewBest;
}

/**
 * Get personal best WPM
 */
export function getPersonalBest() {
  const history = readHistory();
  return history.personalBest;
}

/**
 * Get recent test results
 */
export function getRecentTests(count = 10) {
  const history = readHistory();
  return history.tests.slice(0, count);
}
