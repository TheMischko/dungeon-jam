import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { iconSet, volumeIconSet } from '@general/icons/icons';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { PlaylistWithTagData } from '../../../../../../../../../general/models/playlist.model';
import { PlaylistStore } from '@general/stores/playlist.store';
import { GridItemSizeConfig } from '../../../../../../models/grid-item-size-config.model';

@Component({
  selector: 'app-playlist-grid-item',
  imports: [NgStyle, LucideAngularModule],
  templateUrl: './playlist-grid-item.component.html',
  styleUrl: './playlist-grid-item.component.scss',
})
export class PlaylistGridItemComponent {
  private readonly playlistStore = inject(PlaylistStore);
  readonly playlist = input.required<PlaylistWithTagData>();
  readonly sizeConfig = input.required<GridItemSizeConfig>();
  readonly isPlaying = input<boolean>(false);
  readonly playlistImageUrl = input<string | null>(null);

  readonly playlistClick = output<string>();
  readonly playPlaylist = output<string>();
  readonly pausePlaylist = output<string>();

  readonly isHovering = signal(false);
  readonly parentPlaylist = computed(() => {
    return this.playlistStore.getParent(this.playlist().id);
  });

  readonly DEFAULT_IMAGE = '/assets/playlist.img';
  readonly playIcon = iconSet.PlayIcon;
  readonly pauseIcon = iconSet.PauseIcon;
  readonly tracksIcon = iconSet.TracksIcon;
  readonly playingIcon = volumeIconSet.NormalIcon;

  readonly imageSrc = computed<string>(() => {
    return this.playlistImageUrl() ?? this.DEFAULT_IMAGE;
  });
  readonly imageSizeStyle = computed<Record<string, string>>(() => {
    const size = `${this.sizeConfig().imageSize ?? 250}px`;
    return {
      width: size,
      height: size,
    };
  });
  readonly titleSizeStyle = computed<Record<string, unknown>>(() => {
    const sizeConfig = this.sizeConfig();
    return {
      'font-weight': sizeConfig.titleBold ? 'bold' : 'normal',
      'font-size': `${sizeConfig.fontSize}px`,
    };
  });
  readonly tagsSizeStyle = computed<Record<string, unknown>>(() => {
    const sizeConfig = this.sizeConfig();
    const fontSize = sizeConfig.fontSize - 4;
    return {
      'font-size': `${fontSize}px`,
      'max-width': `${sizeConfig.imageSize}px`,
    };
  });
  readonly overlaySizeStyle = computed<Record<string, string>>(() => {
    const sizeConfig = this.sizeConfig();
    return {
      width: `${sizeConfig.overlaySize}px`,
      height: `${sizeConfig.overlaySize}px`,
      padding: `${sizeConfig.overlaySize / 4}px`,
    };
  });
  readonly overlayIcon = computed<LucideIconData>(() => {
    if (this.isPlaying()) {
      return this.pauseIcon;
    }
    return this.playIcon;
  });
  readonly showTrackCount = computed<boolean>(() => {
    return !!this.sizeConfig().trackCountSize;
  });
  readonly trackCountSize = computed<Record<string, string>>(() => {
    const sizeConfig = this.sizeConfig();
    return {
      'font-size': `${sizeConfig.trackCountSize}px`,
    };
  });

  onMouseEnter() {
    this.isHovering.set(true);
  }

  onMouseLeave() {
    this.isHovering.set(false);
  }
  onOverlayButtonClick(event: Event) {
    event.stopPropagation();
    const playlist = this.playlist();
    if (this.isPlaying()) {
      return this.pausePlaylist.emit(playlist.id);
    }
    this.playPlaylist.emit(playlist.id);
  }

  onPlaylistClick() {
    this.playlistClick.emit(this.playlist().id);
  }
}
