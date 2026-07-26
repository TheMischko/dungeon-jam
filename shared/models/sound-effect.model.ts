export interface SoundEffect {
  id: string;
  name: string;
  url: string;
  duration: number;
  tags?: string[];
  looping?: boolean;
  volume?: number;
}

export interface SoundEffectCreateData {
  name: string;
  description?: string;
  url: string;
  duration: number;
  tags?: string[];
}

export interface SoundEffectUpdateData {
  id: string;
  name?: string;
  description?: string;
  url?: string;
  duration?: number;
  tags?: string[];
  looping?: boolean;
  volume?: number;
}

export enum SoundEffectContextType {
  Landing = 'landing',
}

export interface SoundEffectReorderQuery {
  soundEffectId: string;
  newOrder: number;
  contextType: SoundEffectContextType;
  contextId?: string;
}
