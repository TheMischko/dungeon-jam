import { Component, inject } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { TracksUploadModalComponent } from '../../modals/tracks-upload-modal/tracks-upload-modal.component';
import { MatButton } from '@angular/material/button';
import { DialogService } from '../../../../services/dialog.service';
import { SongsDropInZoneComponent } from './songs-drop-in-zone/songs-drop-in-zone.component';
import { AudioTrack } from '@shared/models/track.model';

@Component({
  selector: 'app-library-landing-page',
  imports: [MatButton, SongsDropInZoneComponent],
  templateUrl: './library-landing-page.component.html',
  styleUrl: './library-landing-page.component.scss',
})
export class LibraryLandingPageComponent {
  private dialogService = inject(DialogService);

  openUploadDialog(audioTracks?: AudioTrack[]) {
    this.dialogService.open(TracksUploadModalComponent, {
      data: {
        title: 'Upload',
        tracks: audioTracks,
      },
    });
  }
}
