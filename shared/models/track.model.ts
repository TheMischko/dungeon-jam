export interface Track {
  id: string;
  name: string;
  url: string;
  author?: string;
}

export interface AudioTrack {
  title: string,
  fullPath: string,
  author?: string,
  length: number
}