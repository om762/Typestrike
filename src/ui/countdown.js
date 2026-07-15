import { C, getBigNumber, getSize, centerAnsi, renderFrame, hideCursor } from './renderer.js';
import { sleep } from '../utils/helpers.js';

/**
 * Animated 3-2-1-GO! countdown before the test starts.
 */
export async function showCountdown() {
  const colors = [C.error, C.warning, C.success, C.accent];
  const numbers = ['3', '2', '1', 'GO'];

  for (let i = 0; i < numbers.length; i++) {
    const { cols, rows } = getSize();
    const lines = [];
    const bigNum = getBigNumber(numbers[i]);
    const topPad = Math.max(0, Math.floor((rows - bigNum.length) / 2) - 1);

    for (let p = 0; p < topPad; p++) {
      lines.push('');
    }

    // Add "Get ready..." above the number
    if (i < 3) {
      lines.push(centerAnsi(`${C.muted}Get ready...${C.reset}`, cols));
    } else {
      lines.push(centerAnsi(`${colors[i]}${C.bold}Type!${C.reset}`, cols));
    }
    lines.push('');

    for (const line of bigNum) {
      lines.push(centerAnsi(`${colors[i]}${C.bold}${line}${C.reset}`, cols));
    }

    hideCursor();
    renderFrame(lines);

    // Shorter delay for GO!
    await sleep(i === 3 ? 400 : 700);
  }
}
