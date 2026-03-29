import { Directive, HostBinding, HostListener, inject, input, output } from '@angular/core';
import { AudioFilesService } from '../services/audio-files.service';
import { AudioTrack } from '@shared/models/track.model';

@Directive({
  selector: '[appDnd]',
})
export class DndDirective {
  readonly audioFilesService = inject(AudioFilesService);

  readonly accept = input<string>('.*');

  readonly filesDropped = output<AudioTrack[]>();

  constructor() {
    this.audioFilesService.registerDrop((paths) => {
      this.filesDropped.emit(paths);
    });
  }

  @HostBinding('class.file-over')
  fileOver: boolean = false;

  @HostListener('dragenter', ['$event'])
  onDragEnter(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = true;
  }

  @HostListener('dragover', ['$event'])
  onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = true;
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
  }

  @HostListener('drop', ['$event'])
  public onDrop(_: DragEvent) {
    this.fileOver = false;
  }
}
