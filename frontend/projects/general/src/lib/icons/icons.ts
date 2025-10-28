import {
  EllipsisVerticalIcon,
  Grid2x2Icon,
  Grid3x3Icon,
  ListMusicIcon,
  ListStartIcon,
  Music2Icon,
  PauseIcon,
  PlayIcon,
  Repeat2Icon,
  SearchIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SquarePlusIcon,
  Trash2Icon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-angular';

export const iconSet = {
  PlayIcon: PlayIcon,
  PauseIcon: PauseIcon,
  PrevIcon: SkipBackIcon,
  NextIcon: SkipForwardIcon,
  PlayNextIcon: ListStartIcon,
  PlaylistIcon: ListMusicIcon,
  RepeatIcon: Repeat2Icon,
  GridBigIcon: Grid2x2Icon,
  GridSmallIcon: Grid3x3Icon,
  TracksIcon: Music2Icon,
};

export const actionsIconSet = {
  SearchIcon: SearchIcon,
  DeleteIcon: Trash2Icon,
  AddIcon: SquarePlusIcon,
  ActionsMenu: EllipsisVerticalIcon,
};

export const volumeIconSet = {
  MutedIcon: VolumeXIcon,
  LowIcon: Volume1Icon,
  NormalIcon: Volume2Icon,
};
