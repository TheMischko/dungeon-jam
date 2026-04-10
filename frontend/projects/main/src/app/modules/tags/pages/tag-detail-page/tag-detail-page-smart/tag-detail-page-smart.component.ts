import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { taggedTracksStore } from '../../../../../stores/tagged-tracks.store';
import { TagsStore } from '@general/stores/tags.store';
import { TagDetailPageComponent } from '../tag-detail-page.component';
import { TaggedTracksQuery, Track } from '@shared/models/track.model';
import { PlaybackService } from '../../../../../services/playback.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tag-detail-page-smart',
  imports: [TagDetailPageComponent],
  templateUrl: './tag-detail-page-smart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagDetailPageSmartComponent implements OnInit {
  private readonly tracksStore = inject(taggedTracksStore);
  private readonly tagsStore = inject(TagsStore);
  private readonly playbackService = inject(PlaybackService);

  readonly tagId = input<string>('', { alias: 'id' });

  readonly tag = computed(
    () => this.tagsStore.entityMap()[this.tagId()] ?? null
  );
  readonly tracks = this.tracksStore.entities;
  readonly loading = this.tracksStore.loading;
  readonly playingTrackId = toSignal(this.playbackService.currentTrackId$, {
    initialValue: null,
  });

  readonly loadQuery = computed<TaggedTracksQuery>(() => ({
    tagId: this.tagId(),
  }));

  ngOnInit(): void {
    this.tracksStore.load(this.loadQuery);
  }

  updateTitle(newTitle: string | undefined): void {
    const tag = this.tag();
    if (!tag) {
      return;
    }
    if (!newTitle || newTitle.trim().length === 0) {
      console.warn('Invalid title emitted');
      return;
    }
    const updatedTag = {
      ...tag,
      title: newTitle.trim().toLowerCase(),
    };
    this.tagsStore.updateTag(updatedTag);
  }

  updateColor(newColor: string | undefined): void {
    const tag = this.tag();
    if (!tag) {
      return;
    }
    if (newColor?.length != 7 || !newColor.startsWith('#')) {
      console.warn(`Invalid color emitted: ${newColor}`);
      return;
    }
    const updatedTag = {
      ...tag,
      color: newColor,
    };
    this.tagsStore.updateTag(updatedTag);
  }

  async playTrack(track: Track): Promise<void> {
    const tracks = this.tracks();
    const trackIndex = tracks.findIndex((t) => t.id === track.id);
    const queue = [
      ...tracks.slice(trackIndex + 1),
      ...tracks.slice(0, trackIndex)
    ];
    await this.playbackService.play(track, queue);
  }

  pauseTrack(): void {
    this.playbackService.pause();
  }
}
