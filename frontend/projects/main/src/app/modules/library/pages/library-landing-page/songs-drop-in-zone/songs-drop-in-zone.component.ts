import { Component, output } from '@angular/core';
import { DndDirective } from '../../../../../directives/dnd.directive';
import { AudioTrack } from '@shared/models/track.model';

@Component({
  selector: 'app-songs-drop-in-zone',
  imports: [DndDirective],
  templateUrl: './songs-drop-in-zone.component.html',
  styleUrl: './songs-drop-in-zone.component.scss',
})
export class SongsDropInZoneComponent {
  dropped = output<AudioTrack[]>();

  onFilesDropped(files: AudioTrack[]) {
    console.log(files);
    this.dropped.emit(files);
  }
}
