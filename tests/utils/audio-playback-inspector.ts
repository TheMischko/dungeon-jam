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
 * and Web Audio API nodes (Howler masterGain / ctx with html5: false).
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
      let anyHowlPlaying = false;
      if (howler?._howls) {
        for (const howl of howler._howls) {
          const soundsInfo: any[] = [];
          if (typeof howl.playing === 'function' && howl.playing()) {
            anyHowlPlaying = true;
          }
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
          howlDetails.push({
            state: typeof howl.state === 'function' ? howl.state() : undefined,
            playing: typeof howl.playing === 'function' ? howl.playing() : undefined,
            volume: typeof howl.volume === 'function' ? howl.volume() : undefined,
            sounds: soundsInfo,
          });
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

      // Filter active, playing HTML5 elements
      const activeElements = audioElements.filter(
        (el) => !el.paused && !el.muted && el.volume > 0 && el.currentTime > 0
      );

      const hasWebAudioRunning =
        howler?.ctx && howler.ctx.state === 'running';

      const debug = {
        hasHowler: !!howler,
        howlsCount: howler?._howls?.length ?? 0,
        anyHowlPlaying,
        howlDetails,
        domAudioInfo,
        activeElementsCount: activeElements.length,
        webAudioState: howler?.ctx?.state,
      };

      // If nothing is playing and no running audio context exists -> silence
      if (activeElements.length === 0 && !hasWebAudioRunning && !anyHowlPlaying) {
        return {
          isAudible: false,
          maxRms: 0,
          activeElementsCount: 0,
          debugInfo: debug,
        };
      }

      // 3. Set up Web Audio Analyser
      // If Howler has an active AudioContext, use it so we can connect to howler.masterGain directly
      const AudioCtxClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = howler?.ctx || new AudioCtxClass();
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch (_) {}
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      const buffer = new Float32Array(analyser.fftSize);
      const cleanups: (() => void)[] = [];

      try {
        // Connect HTML5 active elements
        for (const el of activeElements) {
          try {
            const captureFn =
              (el as any).captureStream || (el as any).mozCaptureStream;
            if (captureFn) {
              const stream = captureFn.call(el);
              const source = ctx.createMediaStreamSource(stream);
              source.connect(analyser);
              cleanups.push(() => {
                try {
                  source.disconnect(analyser);
                } catch (_) {}
              });
            }
          } catch (_) {}
        }

        // Connect Howler masterGain if on the same AudioContext
        if (howler?.masterGain && howler?.ctx === ctx) {
          try {
            howler.masterGain.connect(analyser);
            cleanups.push(() => {
              try {
                howler.masterGain.disconnect(analyser);
              } catch (_) {}
            });
          } catch (e) {
            (debug as any).masterGainConnectError = String(e);
          }
        }

        let maxRms = 0;
        if (cleanups.length > 0) {
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
            maxRms = 0.1;
          }
        } else if (anyHowlPlaying && hasWebAudioRunning) {
          // Web Audio fallback: Howl is actively playing inside running AudioContext
          maxRms = 0.1;
        }

        return {
          isAudible: maxRms >= rmsThreshold,
          maxRms,
          activeElementsCount: activeElements.length + (anyHowlPlaying ? 1 : 0),
          debugInfo: debug,
        };
      } finally {
        for (const cleanup of cleanups) {
          try {
            cleanup();
          } catch (_) {}
        }
        if (ctx !== howler?.ctx) {
          try {
            await ctx.close();
          } catch (_) {}
        }
      }
    },
    { samplingMs, rmsThreshold }
  );
}
