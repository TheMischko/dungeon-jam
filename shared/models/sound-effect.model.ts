export interface SoundEffect {
  id: string;
  name: string;
  description?: string;
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
