import {
  AudioTrack,
  FileBase64,
  PlaylistTracksQuery,
  StoredPlayback,
  TaggedTracksQuery,
  Track,
} from '@shared/models/track.model';
import {
  PlaylistDiscoverBatchRequest,
  QueryRequest,
} from '@shared/models/request.model';

export type AudioApiWindow = Window &
  typeof globalThis & {
    AUDIO_FILES_API: {
      fetchAudioData: (files: FileList) => Promise<void>;
      registerFileDrop: (
        accept: string,
        callback: (paths: string[]) => void
      ) => void;
      registerAudioFileDrop: (callback: (tracks: AudioTrack[]) => void) => void;
      uploadTracks: (tracks: AudioTrack[]) => Promise<Track[]>;
      loadFileBase64: (filePath: string) => Promise<FileBase64>;
      openAudioFileDialog: () => Promise<AudioTrack[]>;
    };
  } & {
    TRACK_API: {
      getAllTracks: (query?: QueryRequest) => Promise<Track[]>;
      getTrackById: (id: string) => Promise<Track | null>;
      getTracksByPlaylist: (query: PlaylistTracksQuery) => Promise<Track[]>;
      createTrack: (
        name: string,
        url: string,
        duration: number,
        author?: string,
        tags?: string[]
      ) => Promise<Track>;
      updateTrack: (track: Track) => Promise<Track>;
      deleteTrack: (id: string) => Promise<boolean>;
      getTaggedTracks: (query: TaggedTracksQuery) => Promise<Track[]>;
      discoverTracks: (query: PlaylistDiscoverBatchRequest) => Promise<Track[]>;
    };
  } & {
    PLAYBACK_API: {
      loadState: () => Promise<StoredPlayback>;
      updateState: (newState: StoredPlayback) => void;
      updateCaptureSettings: (isLocalMuted: boolean) => void;
    };
  };
