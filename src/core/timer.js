/**
 * Countdown timer with tick callbacks.
 * Used for timed mode countdown and the 3-2-1 pre-test countdown.
 */
export class CountdownTimer {
  constructor(durationSeconds) {
    this.duration = durationSeconds;
    this.remaining = durationSeconds;
    this.interval = null;
    this.onTickCallback = null;
    this.onEndCallback = null;
    this.startTime = null;
    this.running = false;
  }

  onTick(callback) {
    this.onTickCallback = callback;
    return this;
  }

  onEnd(callback) {
    this.onEndCallback = callback;
    return this;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = Date.now();
    this.remaining = this.duration;

    this.interval = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      this.remaining = Math.max(0, this.duration - elapsed);

      if (this.onTickCallback) {
        this.onTickCallback(this.remaining, this.duration);
      }

      if (this.remaining <= 0) {
        this.stop();
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      }
    }, 100); // 100ms tick for smooth display

    // Fire initial tick
    if (this.onTickCallback) {
      this.onTickCallback(this.remaining, this.duration);
    }
  }

  stop() {
    this.running = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getRemaining() {
    return Math.ceil(this.remaining);
  }

  isRunning() {
    return this.running;
  }

  /**
   * Reset timer with optional new duration
   */
  reset(durationSeconds) {
    this.stop();
    if (durationSeconds !== undefined) {
      this.duration = durationSeconds;
    }
    this.remaining = this.duration;
    this.startTime = null;
  }
}
