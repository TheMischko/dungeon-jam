import {
  AfterViewInit,
  Directive,
  HostBinding,
  HostListener,
  inject,
  input,
  output,
} from '@angular/core';
import { AudioFilesService } from '../services/audio-files.service';
import { AudioTrack } from '@shared/models/track.model';
import { AudioApiWindow } from '../models/window-api.model';

@Directive({
  selector: '[appDnd]',
})
export class DndDirective implements AfterViewInit {
  private readonly window = <AudioApiWindow>window;
  readonly audioFilesService = inject(AudioFilesService);

  /**
   * Sets an accept RegExp for general file drop. If undefined only audio files are registered.
   *
   * Use values like `image/.*` or `audio/.*`.
   */
  readonly accept = input<string | undefined>(undefined);

  /**
   * Emits dropped files. It is triggered only with `[accept]` input set.
   */
  readonly filesDropped = output<string[]>();
  readonly audioFilesDropped = output<AudioTrack[]>();

  ngAfterViewInit() {
    if (!this.accept()) {
      this.audioFilesService.registerAudioDrop((paths) => {
        this.audioFilesDropped.emit(paths);
      });
    } else {
      this.window.AUDIO_FILES_API.registerFileDrop(this.accept()!, (paths) => {
        this.filesDropped.emit(paths);
      });
    }
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
