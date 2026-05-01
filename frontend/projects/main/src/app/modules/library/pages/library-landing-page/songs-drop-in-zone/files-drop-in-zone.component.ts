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
  readonly accept = input<string>('audio/.*');
  readonly dropped = output<AudioTrack[]>();

  onFilesDropped(files: AudioTrack[]) {
    console.log('Audio files dropped', files);
    this.dropped.emit(files);
  }
}
