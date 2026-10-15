import {
  StoredPlayback,
  StoredTransitionSettings,
} from '@shared/models/track.model';

export type PlaybackApiWindow = Window &
  typeof globalThis & {
    PLAYBACK_API: {
      loadState: () => Promise<StoredPlayback>;
      updateState: (newState: StoredPlayback) => void;
      updateCaptureSettings: (isLocalMuted: boolean) => void;
      loadTransitionSettings: () => Promise<StoredTransitionSettings>;
      updateTransitionSettings: (newState: StoredTransitionSettings) => void;
      onTransitionChanged: (
        callback: (settings: StoredTransitionSettings) => void | Promise<void>
      ) => void;
    };
  };
