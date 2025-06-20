export interface Track {
  id: string;
  name: string;
  url: string;
  author?: string;
  duration: number;
}

export interface AudioTrack {
  title: string;
  fullPath: string;
  author?: string;
  length: number;
}
