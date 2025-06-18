import { Component, inject } from '@angular/core';
import { TracksUploadModalComponent } from '../../modals/tracks-upload-modal/tracks-upload-modal.component';
import { MatButton } from '@angular/material/button';
import { DialogService } from '../../../../services/dialog.service';
import { SongsDropInZoneComponent } from './songs-drop-in-zone/songs-drop-in-zone.component';
import { AudioTrack } from '@shared/models/track.model';
import { AudioFilesService } from '../../../../services/audio-files.service';

@Component({
  selector: 'app-library-landing-page',
  imports: [MatButton, SongsDropInZoneComponent],
  templateUrl: './library-landing-page.component.html',
  styleUrl: './library-landing-page.component.scss',
})
export class LibraryLandingPageComponent {
  private readonly dialogService = inject(DialogService);
  private readonly audioFilesService = inject(AudioFilesService);

  openUploadDialog(audioTracks?: AudioTrack[]) {
    const dialog = this.dialogService.open<
      TracksUploadModalComponent,
      AudioTrack[] | null
    >(TracksUploadModalComponent, {
      data: {
        title: 'Upload',
        tracks: audioTracks,
      },
    });

    dialog.afterClosed$.subscribe((tracks) => {
      if (!tracks) {
        return;
      }
      this.audioFilesService.uploadAudioTracks(tracks).subscribe(() => {
        console.log('uploaded');
      });
    });
  }
}
