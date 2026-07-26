import { inject, Injectable } from '@angular/core';
import { AudioTrack } from '@shared/models/track.model';
import { EMPTY, Observable, tap } from 'rxjs';
import { DialogService } from '../../../services/dialog.service';
import {
  SoundEffectUploadModalComponent,
  SoundEffectUploadModalData,
} from '../modals/sound-effect-upload-modal/sound-effect-upload-modal.component';
import { SoundEffectFormData } from '../../../forms/sound-effect-form/sound-effect-form.model';
import { TagData } from '@shared/models/tag.model';
import { SoundEffectStore } from '@general/stores/sound-effect.store';
import { SoundEffectCreateData } from '@shared/models/sound-effect.model';

@Injectable({
  providedIn: 'root',
})
export class NewSoundEffectUploadService {
  private readonly dialogService = inject(DialogService);
  private readonly soundEffectStore = inject(SoundEffectStore);

  public startUploadSequence(audioTracks?: AudioTrack[]): Observable<unknown> {
    if (!audioTracks?.length) {
      return EMPTY;
    }
    return this.openManualUploadDialog(audioTracks).pipe(
      tap((data) => {
        console.log('Creating sfx', data);
        if (!data) {
          return;
        }

        data
          .map((sfx) => {
            const track = audioTracks.find(
              (track) => track.fullPath === sfx.path
            )!;
            return {
              name: sfx.title,
              tags: sfx.tags.map((t) => t.id),
              url: track.fullPath,
              duration: track.length,
            } as SoundEffectCreateData;
          })
          .forEach((createData) => {
            this.soundEffectStore.createEffect(createData);
          });
      })
    );
  }

  public openManualUploadDialog(
    audioTracks: AudioTrack[]
  ): Observable<SoundEffectFormData[] | undefined> {
    const dialogRef = this.dialogService.open<
      SoundEffectUploadModalComponent,
      SoundEffectFormData[]
    >(SoundEffectUploadModalComponent, {
      data: {
        audioTracks,
        tagsMap: new Map<string, TagData>(),
      } as SoundEffectUploadModalData,
    });
    return dialogRef.afterClosed$;
  }
}
