import { Page } from 'playwright';

export interface AudioInspectionResult {
  isAudible: boolean;
  maxRms: number;
  activeElementsCount: number;
  debugInfo?: any;
}

/**
 * Measures whether audio is currently playing and audible in the given page/window.
 * Inspects both HTML5 Audio instances (created by Howler with html5: true)
 * and Web Audio API nodes.
 */
export async function measureAudioOutput(
  page: Page,
  samplingMs = 600,
  rmsThreshold = 0.01
): Promise<AudioInspectionResult> {
  return await page.evaluate(
    async ({ samplingMs, rmsThreshold }) => {
      const howler = (window as any).Howler;
      const audioElements: HTMLAudioElement[] = [];

      // 1. Collect HTML5 audio elements managed by Howler (_howls)
      const howlDetails: any[] = [];
      if (howler?._howls) {
        for (const howl of howler._howls) {
          const soundsInfo: any[] = [];
          for (const sound of howl._sounds || []) {
            if (sound._node && sound._node instanceof HTMLAudioElement) {
              audioElements.push(sound._node);
              soundsInfo.push({
                paused: sound._node.paused,
                currentTime: sound._node.currentTime,
                duration: sound._node.duration,
                volume: sound._node.volume,
                muted: sound._node.muted,
                src: sound._node.src,
              });
            }
          }
          howlDetails.push({ state: howl.state(), playing: howl.playing(), sounds: soundsInfo });
        }
      }

      // 2. Also check any <audio> elements in the DOM
      const domAudioInfo: any[] = [];
      document.querySelectorAll('audio').forEach((el) => {
        if (!audioElements.includes(el)) {
          audioElements.push(el);
        }
        domAudioInfo.push({
          paused: el.paused,
          currentTime: el.currentTime,
          src: el.src,
        });
      });

      // Filter active, playing elements
      const activeElements = audioElements.filter(
        (el) => !el.paused && !el.muted && el.volume > 0 && el.currentTime > 0
      );

      const hasWebAudioRunning =
        howler?.ctx && howler.ctx.state === 'running';

      const debug = {
        hasHowler: !!howler,
        howlsCount: howler?._howls?.length ?? 0,
        howlDetails,
        domAudioInfo,
        activeElementsCount: activeElements.length,
        webAudioState: howler?.ctx?.state,
      };

      // If nothing is playing and no running audio context exists -> silence
      if (activeElements.length === 0 && !hasWebAudioRunning) {
        return {
          isAudible: false,
          maxRms: 0,
          activeElementsCount: 0,
          debugInfo: debug,
        };
      }


      // 3. Set up Web Audio Analyser
      const AudioCtxClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      const buffer = new Float32Array(analyser.fftSize);
      const sourcesToDisconnect: { disconnect: () => void }[] = [];

      try {
        for (const el of activeElements) {
          try {
            const captureFn =
              (el as any).captureStream || (el as any).mozCaptureStream;
            if (captureFn) {
              const stream = captureFn.call(el);
              const source = ctx.createMediaStreamSource(stream);
              source.connect(analyser);
              sourcesToDisconnect.push(source);
            }
          } catch (_) {
            // captureStream may fail on cross-origin or certain blob formats
          }
        }

        if (howler?.masterGain) {
          try {
            howler.masterGain.connect(analyser);
            sourcesToDisconnect.push(howler.masterGain);
          } catch (_) {}
        }

        let maxRms = 0;
        if (sourcesToDisconnect.length > 0) {
          const startTime = performance.now();
          while (performance.now() - startTime < samplingMs) {
            analyser.getFloatTimeDomainData(buffer);
            let sumSq = 0;
            for (let i = 0; i < buffer.length; i++) {
              sumSq += buffer[i] * buffer[i];
            }
            const rms = Math.sqrt(sumSq / buffer.length);
            if (rms > maxRms) {
              maxRms = rms;
            }
            await new Promise((r) => setTimeout(r, 40));
          }
        } else if (activeElements.length > 0) {
          // Fallback if captureStream is restricted: verify if currentTime actually advances
          const t0 = activeElements[0].currentTime;
          await new Promise((r) => setTimeout(r, samplingMs));
          const t1 = activeElements[0].currentTime;
          if (t1 > t0 + 0.05) {
            maxRms = 0.1; // Media playback is actively progressing
          }
        }

        return {
          isAudible: maxRms >= rmsThreshold,
          maxRms,
          activeElementsCount: activeElements.length,
        };
      } finally {
        for (const s of sourcesToDisconnect) {
          try {
            s.disconnect();
          } catch (_) {}
        }
        try {
          await ctx.close();
        } catch (_) {}
      }
    },
    { samplingMs, rmsThreshold }
  );
}
