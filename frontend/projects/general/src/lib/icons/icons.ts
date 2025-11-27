import {
  EllipsisVerticalIcon,
  Grid2x2Icon,
  Grid3x3Icon,
  ListFilterIcon,
  ListMusicIcon,
  ListStartIcon,
  LoaderCircleIcon,
  Music2Icon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  Repeat2Icon,
  SaveIcon,
  SearchIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SquarePlusIcon,
  Trash2Icon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
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
  LoadingIcon: LoaderCircleIcon,
};

export const actionsIconSet = {
  SearchIcon: SearchIcon,
  DeleteIcon: Trash2Icon,
  AddIcon: SquarePlusIcon,
  ActionsMenu: EllipsisVerticalIcon,
  EditIcon: PencilIcon,
  CrossIcon: XIcon,
  SaveIcon: SaveIcon,
  FilterIcon: ListFilterIcon,
};

export const volumeIconSet = {
  MutedIcon: VolumeXIcon,
  LowIcon: Volume1Icon,
  NormalIcon: Volume2Icon,
};
