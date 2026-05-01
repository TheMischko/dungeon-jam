import { Component, input, output } from '@angular/core';
import { DndDirective } from '../../../../../directives/dnd.directive';
import { AudioTrack } from '@shared/models/track.model';

@Component({
  selector: 'app-songs-drop-in-zone',
  imports: [DndDirective],
  templateUrl: './files-drop-in-zone.component.html',
  styleUrl: './files-drop-in-zone.component.scss',
})
export class FilesDropInZoneComponent {
  /**
   * Sets an accept RegExp for general file drop. If undefined only audio files are registered.
   *
   * Use values like `image/.*` or `audio/.*`.
   */
  readonly accept = input<string | undefined>(undefined);
  /**
   * Emits dropped file paths. It is triggered only with `[accept]` input set.
   */
  readonly filesDropped = output<string[]>();
  readonly audioDropped = output<AudioTrack[]>();

  onAudioFilesDropped(files: AudioTrack[]) {
    this.audioDropped.emit(files);
  }
}
