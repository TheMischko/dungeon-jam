import {Directive, HostBinding, inject, input, output} from '@angular/core';
import {AudioFilesService} from '../services/audio-files.service';

@Directive({
  selector: '[appDnd]'
})
export class DndDirective {
  accept = input<string>('.*');

  filesDropped = output<string[]>();

  audioFilesService = inject(AudioFilesService);

  @HostBinding('class.file-over') fileOver: boolean = false;

  constructor() {
    this.audioFilesService.registerDrop((paths) => {
      this.filesDropped.emit(paths);
    })
  }
}
