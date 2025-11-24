/**
 * Jitter Buffer Service
 * Smooths out network jitter and packet arrival timing variations
 * Maintains a circular buffer to handle out-of-order or delayed packets
 */

export class JitterBuffer {
  private buffer: Buffer[] = [];
  private readonly targetBufferSize: number; // frames to buffer
  private isWarmed = false;
  private droppedFrames = 0;
  private processedFrames = 0;
  private warnedAboutSize = false;

  constructor(
    private frameSize: number, // bytes per frame
    private targetLatencyMs: number = 200, // target buffering latency
  ) {
    const frameDurationMs = 20; // 20ms Opus frames
    this.targetBufferSize = Math.ceil(
      (targetLatencyMs / frameDurationMs) * 1.5,
    );
  }

  /**
   * Add audio frame to buffer
   * Returns true if buffer is ready for output
   */
  addFrame(data: Buffer): boolean {
    if (data.length !== this.frameSize) {
      // Only warn on first mismatch or significant differences to avoid spam
      if (!this.warnedAboutSize) {
        console.warn(
          `[JitterBuffer] Frame size mismatch: expected ${this.frameSize}, got ${data.length}`,
        );
        this.warnedAboutSize = true;
      }
      return false;
    }

    this.buffer.push(data);

    // Warm up: wait until we have enough frames
    if (!this.isWarmed) {
      if (this.buffer.length >= this.targetBufferSize) {
        this.isWarmed = true;
        console.log(
          `[JitterBuffer] Buffer warmed up with ${this.buffer.length} frames`,
        );
      }
      return false;
    }

    return true;
  }

  /**
   * Get next frame from buffer
   * Returns null if buffer is depleted (underrun)
   */
  getFrame(): Buffer | null {
    if (this.buffer.length === 0) {
      console.warn('[JitterBuffer] Buffer underrun! No frames available');
      this.droppedFrames++;
      return null;
    }

    const frame = this.buffer.shift();
    this.processedFrames++;

    // If buffer grows too large, drop oldest frames to prevent excessive latency
    if (this.buffer.length > this.targetBufferSize * 2) {
      const excess = this.buffer.length - this.targetBufferSize;
      console.warn(
        `[JitterBuffer] Buffer overflow detected, dropping ${excess} frames`,
      );
      this.buffer = this.buffer.slice(excess);
      this.droppedFrames += excess;
    }

    return frame!;
  }

  /**
   * Get current buffer statistics
   */
  getStats() {
    return {
      currentBufferSize: this.buffer.length,
      targetBufferSize: this.targetBufferSize,
      isWarmed: this.isWarmed,
      droppedFrames: this.droppedFrames,
      processedFrames: this.processedFrames,
      dropRate:
        this.processedFrames > 0
          ? ((this.droppedFrames / this.processedFrames) * 100).toFixed(2) + '%'
          : '0%',
    };
  }

  /**
   * Check if buffer is healthy
   */
  isHealthy(): boolean {
    if (!this.isWarmed) return false;
    return (
      this.buffer.length > 0 && this.buffer.length < this.targetBufferSize * 2
    );
  }

  /**
   * Reset buffer
   */
  reset(): void {
    this.buffer = [];
    this.isWarmed = false;
    this.droppedFrames = 0;
    this.processedFrames = 0;
  }
}
