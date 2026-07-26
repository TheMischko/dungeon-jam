import { TagData } from '@shared/models/tag.model';

export interface TagRow extends TagData {
  trackCount: number;
  playlistCount: number;
}
