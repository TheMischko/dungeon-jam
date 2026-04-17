import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Track } from '@shared/models/track.model';
import { TagData } from '@shared/models/tag.model';
import { SongsTableComponent } from '../../../library/pages/library-landing-page/songs-table/songs-table.component';
import { NgStyle } from '@angular/common';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import { actionsIconSet } from '@general/icons/icons';
import { ActionsMenuConfig } from '@general/components/display/actions-menu/actions-menu.component';
import { Playlist } from '@shared/models/playlist.model';
import { MatButton } from '@angular/material/button';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-tag-detail-page',
  imports: [
    SongsTableComponent,
    NgStyle,
    IconButtonComponent,
    MatButton,
    LucideAngularModule,
  ],
  templateUrl: './tag-detail-page.component.html',
  styleUrl: './tag-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TagDetailPageComponent {
  readonly tag = input<TagData | null>(null);
  readonly tracks = input<Track[]>([]);
  readonly loading = input<boolean>(false);
  readonly playingTrackId = input<string | null>(null);
  readonly songsTableActions = input<ActionsMenuConfig<Track, Playlist>[]>([])

  readonly playTrack = output<Track>();
  readonly pauseTrack = output<void>();
  readonly colorChange = output<string>();
  readonly titleChange = output<string>();
  readonly addTracks = output<void>();

  readonly titleInput = viewChild('titleInput', { read: ElementRef<HTMLInputElement>});
  readonly colorInput = viewChild.required('colorInput', { read: ElementRef<HTMLInputElement>});

  readonly titleEditMode = signal<boolean>(false);

  readonly pageTitle = computed(() => {
    const tagTitle = this.tag()?.title || 'Unknown';
    return tagTitle.charAt(0).toUpperCase() + tagTitle.slice(1);
  });

  readonly editIcon = actionsIconSet.EditIcon;
  readonly confirmIcon = actionsIconSet.SaveIcon;
  readonly cancelIcon = actionsIconSet.CrossIcon;
  readonly addTracksIcon = actionsIconSet.AddIcon;

  readonly tagColorStyle = computed(() => {
    const color = this.tag()?.color;
    if(!color){
      return {};
    }

    return {
      'background-color': color,
    }
  });

  openColorPicker(): void {
    this.colorInput().nativeElement.click();
  }

  emitNewColor(): void {
    const newColor = this.colorInput().nativeElement.value;
    this.colorChange.emit(newColor);
  }

  startTitleEdit(): void {
    this.titleEditMode.set(true);
  }

  stopEditMode(): void {
    this.titleEditMode.set(false);
    const titleInput = this.titleInput();
    if(titleInput){
      titleInput.nativeElement.value = this.tag()?.title ?? '';
      return;
    }
  }

  updateTitle() {
    const titleInput = this.titleInput();
    if(!titleInput){
      return;
    }
    const value = titleInput.nativeElement.value.trim();
    if(value.length === 0){
      titleInput.nativeElement.value = this.tag()?.title ?? '';
      return;
    }

    this.titleChange.emit(value);
    this.stopEditMode();
  }

}
