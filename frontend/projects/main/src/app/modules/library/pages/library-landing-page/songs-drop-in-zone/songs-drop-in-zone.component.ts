import {Component} from '@angular/core';
import {DndDirective} from '../../../../../directives/dnd.directive';

@Component({
  selector: 'app-songs-drop-in-zone',
  imports: [
    DndDirective
  ],
  templateUrl: './songs-drop-in-zone.component.html',
  styleUrl: './songs-drop-in-zone.component.scss'
})
export class SongsDropInZoneComponent {
  onFilesDropped(files: string[]) {
      console.log(files);
  }
}
