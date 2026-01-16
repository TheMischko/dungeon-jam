import { Component, computed, input, output, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { iconSet, volumeIconSet } from '@general/icons/icons';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { PlaylistViewData } from '../../../../../../../../../general/models/playlist.model';
import { Playlist } from '@shared/models/playlist.model';

@Component({
  selector: 'app-playlist-grid-item',
  imports: [NgStyle, LucideAngularModule],
  templateUrl: './playlist-grid-item.component.html',
  styleUrl: './playlist-grid-item.component.scss',
})
export class PlaylistGridItemComponent {
  readonly playlist = input.required<PlaylistViewData & { parentPlaylist: Playlist | null }>();
  readonly sizeConfig = input.required<GridItemSizeConfig>();
  readonly isPlaying = input<boolean>(false);

  readonly playlistClick = output<string>();
  readonly playPlaylist = output<string>();
  readonly pausePlaylist = output<string>();

  readonly isHovering = signal(false);

  readonly DEFAULT_IMAGE = '/assets/playlist.img';
  readonly playIcon = iconSet.PlayIcon;
  readonly pauseIcon = iconSet.PauseIcon;
  readonly tracksIcon = iconSet.TracksIcon;
  readonly playingIcon = volumeIconSet.NormalIcon;

  readonly imageSrc = computed<string>(() => {
    return this.playlist()?.imageUrl ?? this.DEFAULT_IMAGE;
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

export type GridItemSizeConfig = {
  imageSize: number;
  fontSize: number;
  overlaySize: number;
  trackCountSize?: number;
  titleBold: boolean;
  hideTags: boolean;
  hideTracks: boolean;
};
