import {
  Grid2x2Icon,
  Grid3x3Icon,
  ListMusicIcon,
  PauseIcon,
  PlayIcon,
  Repeat2Icon,
  SearchIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-angular';

export const iconSet = {
  PlayIcon: PlayIcon,
  PauseIcon: PauseIcon,
  PrevIcon: SkipBackIcon,
  NextIcon: SkipForwardIcon,
  PlaylistIcon: ListMusicIcon,
  RepeatIcon: Repeat2Icon,
  GridBigIcon: Grid2x2Icon,
  GridSmallIcon: Grid3x3Icon,
};

export const formIconSet = {
  SearchIcon: SearchIcon,
};

export const volumeIconSet = {
  MutedIcon: VolumeXIcon,
  LowIcon: Volume1Icon,
  NormalIcon: Volume2Icon,
};
