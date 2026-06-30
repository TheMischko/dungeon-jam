import { Component, computed, inject, input, output } from '@angular/core';
import { NgStyle } from '@angular/common';
import { iconSet, volumeIconSet } from '@general/icons/icons';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { PlaylistWithTagData } from '../../../../../../../../../general/models/playlist.model';
import { PlaylistStore } from '@general/stores/playlist.store';
import { GridPlaylistSizeConfig } from '../../../../../../models/grid-item-size-config.model';
import { GridItemComponent } from '../../../../../../components/grid/grid-item/grid-item.component';

@Component({
  selector: 'app-playlist-grid-item',
  imports: [NgStyle, LucideAngularModule, GridItemComponent],
  templateUrl: './playlist-grid-item.component.html',
  styleUrl: './playlist-grid-item.component.scss',
})
export class PlaylistGridItemComponent {
  private readonly playlistStore = inject(PlaylistStore);
  readonly playlist = input.required<PlaylistWithTagData>();
  readonly sizeConfig = input.required<GridPlaylistSizeConfig>();
  readonly isPlaying = input<boolean>(false);
  readonly playlistImageUrl = input<string | null>(null);

  readonly playlistClick = output<string>();
  readonly playPlaylist = output<string>();
  readonly pausePlaylist = output<string>();

  readonly parentPlaylist = computed(() => {
    return this.playlistStore.getParent(this.playlist().id);
  });

  readonly PlaylistIcon = iconSet.PlaylistIcon;
  readonly playIcon = iconSet.PlayIcon;
  readonly pauseIcon = iconSet.PauseIcon;
  readonly tracksIcon = iconSet.TracksIcon;
  readonly playingIcon = volumeIconSet.NormalIcon;

  readonly imageSrc = computed<string[]>(() => {
    const imageUrl = this.playlistImageUrl();
    return imageUrl ? [imageUrl] : [];
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

  onOverlayButtonClick(event: Event) {
    event.stopPropagation();
    const playlist = this.playlist();
    if (this.isPlaying()) {
      return this.pausePlaylist.emit(playlist.id);
    }
    if (!playlist.trackIds.length) {
      return;
    }
    this.playPlaylist.emit(playlist.id);
  }

  onPlaylistClick() {
    this.playlistClick.emit(this.playlist().id);
  }
}
