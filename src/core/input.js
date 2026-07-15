import readline from 'readline';

/**
 * Raw input handler.
 * Sets up raw mode on stdin and dispatches character-level events.
 */
export class InputHandler {
  constructor() {
    this.listeners = new Map();
    this.active = false;
  }

  /**
   * Register a listener for a specific event type.
   * Event types: 'char', 'backspace', 'tab', 'escape', 'enter', 'up', 'down', 'left', 'right'
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return this;
  }

  /**
   * Remove all listeners for an event, or all listeners if no event specified
   */
  off(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  }

  _emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(data);
      }
    }
  }

  /**
   * Start listening for keypresses
   */
  start() {
    if (this.active) return;
    this.active = true;

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();

    this._keypressHandler = (str, key) => {
      if (!key) {
        // Raw character with no key metadata
        if (str) {
          this._emit('char', str);
        }
        return;
      }

      // Ctrl+C — always exit
      if (key.ctrl && key.name === 'c') {
        this.stop();
        process.exit(0);
      }

      // Ctrl+L — ignore (don't mess with screen)
      if (key.ctrl) return;

      // Special keys
      switch (key.name) {
        case 'backspace':
          this._emit('backspace');
          break;
        case 'tab':
          this._emit('tab');
          break;
        case 'escape':
          this._emit('escape');
          break;
        case 'return':
          this._emit('enter');
          break;
        case 'up':
          this._emit('up');
          break;
        case 'down':
          this._emit('down');
          break;
        case 'left':
          this._emit('left');
          break;
        case 'right':
          this._emit('right');
          break;
        case 'space':
          this._emit('char', ' ');
          break;
        default:
          // Regular character
          if (str && str.length === 1 && !key.ctrl && !key.meta) {
            this._emit('char', str);
          }
          break;
      }
    };

    process.stdin.on('keypress', this._keypressHandler);
  }

  /**
   * Stop listening and restore terminal
   */
  stop() {
    if (!this.active) return;
    this.active = false;

    if (this._keypressHandler) {
      process.stdin.removeListener('keypress', this._keypressHandler);
      this._keypressHandler = null;
    }

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
  }

  /**
   * Check if input is active
   */
  isActive() {
    return this.active;
  }
}
