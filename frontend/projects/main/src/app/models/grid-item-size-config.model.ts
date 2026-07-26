import { GridItemSizeConfig } from './grid.model';

export interface GridPlaylistSizeConfig extends GridItemSizeConfig {
  trackCountSize?: number;
  titleBold?: boolean;
  hideTracks?: boolean;
}

export interface GridSoundEffectSizeConfig extends GridItemSizeConfig {
  tagFontSize?: number;
  volumeSize?: number;
  titleBold?: boolean;
  hideVolume?: boolean;
  hideLoop?: boolean;
  hidePlay?: boolean;
  hideIcon?: boolean;
  hideActions?: boolean;
}
