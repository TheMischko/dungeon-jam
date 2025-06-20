import { AudioTrack, Track } from '@shared/models/track.model';

export type AudioApiWindow = Window &
  typeof globalThis & {
    AUDIO_FILES_API: {
      fetchAudioData: (files: FileList) => Promise<void>;
      registerFileDrop: (callback: (paths: AudioTrack[]) => void) => void;
      uploadTracks: (tracks: AudioTrack[]) => Promise<void>;
    };
  } & {
    TRACK_API: {
      getAllTracks: () => Promise<Track[]>;
      getTrackById: (id: string) => Promise<Track | null>;
      createTrack: (
        name: string,
        url: string,
        duration: number,
        author?: string,
      ) => Promise<Track>;
    };
  };
