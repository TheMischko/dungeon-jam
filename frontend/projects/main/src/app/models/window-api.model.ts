import { AudioTrack, FileBase64, Track } from '@shared/models/track.model';

export type AudioApiWindow = Window &
  typeof globalThis & {
    AUDIO_FILES_API: {
      fetchAudioData: (files: FileList) => Promise<void>;
      registerFileDrop: (callback: (paths: AudioTrack[]) => void) => void;
      uploadTracks: (tracks: AudioTrack[]) => Promise<void>;
      loadFileBase64: (filePath: string) => Promise<FileBase64>;
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
