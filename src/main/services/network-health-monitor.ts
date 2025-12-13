/**
 * Network Health Monitor
 * Tracks connection quality and triggers adaptive bitrate adjustments
 */

export interface NetworkQuality {
  latencyMs: number;
  packetLossPercent: number;
  jitterMs: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface BitrateRecommendation {
  bitrate: number; // kbps
  quality: 'hq' | 'standard' | 'low' | 'minimal';
}

export class NetworkHealthMonitor {
  private latencies: number[] = [];
  private lastPacketTime: number = Date.now();
  private packetsReceived = 0;
  private packetsExpected = 0;
  private currentBitrate = 128; // kbps
  private onQualityChange?: (quality: NetworkQuality) => void;
  private onBitrateRecommendation?: (rec: BitrateRecommendation) => void;
  private monitoringInterval?: NodeJS.Timeout;

  /**
   * Register callback for quality changes
   */
  onQualityChanged(callback: (quality: NetworkQuality) => void): void {
    this.onQualityChange = callback;
  }

  /**
   * Register callback for bitrate recommendations
   */
  onBitrateRecommended(callback: (rec: BitrateRecommendation) => void): void {
    this.onBitrateRecommendation = callback;
  }

  /**
   * Record packet arrival time
   */
  recordPacketArrival(sequenceNumber: number): void {
    const now = Date.now();
    const latency = now - this.lastPacketTime;
    this.latencies.push(latency);

    // Keep only last 100 measurements
    if (this.latencies.length > 100) {
      this.latencies.shift();
    }

    this.packetsReceived++;
    this.packetsExpected = Math.max(this.packetsExpected, sequenceNumber);
    this.lastPacketTime = now;
  }

  /**
   * Calculate current network quality
   */
  getQuality(): NetworkQuality {
    const avgLatency =
      this.latencies.length > 0
        ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
        : 0;

    const jitter =
      this.latencies.length > 1
        ? Math.sqrt(
            this.latencies
              .map((l) => Math.pow(l - avgLatency, 2))
              .reduce((a, b) => a + b, 0) / this.latencies.length,
          )
        : 0;

    const packetLoss =
      this.packetsExpected > 0
        ? Math.max(
            0,
            ((this.packetsExpected - this.packetsReceived) /
              this.packetsExpected) *
              100,
          )
        : 0;

    const quality = this.assessQuality(avgLatency, jitter, packetLoss);

    return {
      latencyMs: Math.round(avgLatency),
      packetLossPercent: Number(packetLoss.toFixed(2)),
      jitterMs: Math.round(jitter),
      quality,
    };
  }

  /**
   * Assess network quality based on metrics
   */
  private assessQuality(
    latency: number,
    jitter: number,
    packetLoss: number,
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (latency > 150 || jitter > 50 || packetLoss > 5) {
      return 'poor';
    }
    if (latency > 100 || jitter > 30 || packetLoss > 2) {
      return 'fair';
    }
    if (latency > 50 || jitter > 15 || packetLoss > 0.5) {
      return 'good';
    }
    return 'excellent';
  }

  /**
   * Get recommended bitrate based on network quality
   */
  getbitrateRecommendation(): BitrateRecommendation {
    const quality = this.getQuality();

    switch (quality.quality) {
      case 'excellent':
        return { bitrate: 128, quality: 'hq' };
      case 'good':
        return { bitrate: 96, quality: 'standard' };
      case 'fair':
        return { bitrate: 64, quality: 'low' };
      case 'poor':
        return { bitrate: 32, quality: 'minimal' };
      default:
        return { bitrate: 96, quality: 'standard' };
    }
  }

  /**
   * Start monitoring and trigger periodic quality assessments
   */
  startMonitoring(intervalMs: number = 5000): void {
    this.stopMonitoring();

    this.monitoringInterval = setInterval(() => {
      const quality = this.getQuality();
      const recommendation = this.getbitrateRecommendation();

      // console.log(
      //   `[NetworkMonitor] Quality: ${quality.quality} | Latency: ${quality.latencyMs}ms | Jitter: ${quality.jitterMs}ms | Loss: ${quality.packetLossPercent}%`,
      // );

      if (recommendation.bitrate !== this.currentBitrate) {
        // console.log(
        //   `[NetworkMonitor] Bitrate change recommended: ${this.currentBitrate} → ${recommendation.bitrate} kbps`,
        // );
        this.currentBitrate = recommendation.bitrate;
        this.onBitrateRecommendation?.(recommendation);
      }

      this.onQualityChange?.(quality);
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.latencies = [];
    this.packetsReceived = 0;
    this.packetsExpected = 0;
  }
}
