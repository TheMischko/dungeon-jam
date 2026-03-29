import { inject, Injectable } from '@angular/core';
import { AudioTrack, Track } from '@shared/models/track.model';
import { DialogService } from '../../../services/dialog.service';
import { TrackService } from '../../../services/track.service';
import { combineLatest, EMPTY, finalize, map, Observable, of, switchMap, tap } from 'rxjs';
import {
  DuplicateTracksModalComponent,
  DuplicateTracksModalData,
  DuplicateTracksModalResult,
} from '../modals/duplicate-tracks-modal/duplicate-tracks-modal.component';
import {
  BulkUploadConfirmationModalComponent,
  BulkUploadConfirmationModalData,
  BulkUploadConfirmationModalResult,
} from '../modals/bulk-upload-confirmation-modal/bulk-upload-confirmation-modal.component';
import { TracksUploadModalComponent } from '../modals/tracks-upload-modal/tracks-upload-modal.component';
import { AudioFilesService } from '../../../services/audio-files.service';

const BULK_UPLOAD_THRESHOLD = 10;

@Injectable({
  providedIn: 'root',
})
export class NewTrackDropInService {
  private readonly dialogService = inject(DialogService);
  private readonly trackApiService = inject(TrackService);
  private readonly audioFilesService = inject(AudioFilesService);

  private duplicateMap: Map<string, Track> = new Map();

  public startUploadSequence(audioTracks?: AudioTrack[]): Observable<void> {
    if (!audioTracks?.length) {
      return EMPTY;
    }

    this.reset();

    return this.checkDuplicateTracks(audioTracks).pipe(
      switchMap((hasDuplicates) => {
        if (!hasDuplicates) {
          return of(audioTracks);
        }
        return this.openDuplicatesDialog(audioTracks);
      }),
      switchMap((tracksToUpload) => {
        if (!tracksToUpload?.length) {
          return EMPTY;
        }
        if (tracksToUpload.length >= BULK_UPLOAD_THRESHOLD) {
          return this.openBulkConfirmationDialog(tracksToUpload);
        }
        return this.openUploadDialog(tracksToUpload);
      }),
      finalize(() => this.reset()),
    );
  }

  /**
   * Checks for duplicate tracks based on their full path and populates the duplicateMap with any found duplicates.
   *
   * Emits a boolean indicating whether any duplicates were found.
   */
  private checkDuplicateTracks(tracks: AudioTrack[]): Observable<boolean> {
    return this.trackApiService.findDuplicates(tracks.map((t) => t.fullPath)).pipe(
      tap((duplicates) => {
        duplicates
          .filter((d) => !!d.track)
          .forEach((d) => this.duplicateMap.set(d.path, d.track as Track));
      }),
      map((duplicates) => duplicates.some((d) => !!d.track)),
    );
  }

  /**
   * Opens a dialog to inform the user about duplicate tracks and allows them to choose whether to override existing tracks or skip duplicates.
   */
  private openDuplicatesDialog(audioTracks: AudioTrack[]): Observable<AudioTrack[] | undefined> {
    const duplicates = audioTracks
      .filter((t) => this.duplicateMap.has(t.fullPath))
      .map((t) => ({ path: t.fullPath, track: this.duplicateMap.get(t.fullPath) as Track }));

    const dialogRef = this.dialogService.open<
      DuplicateTracksModalComponent,
      DuplicateTracksModalResult
    >(DuplicateTracksModalComponent, {
      data: { duplicates } satisfies DuplicateTracksModalData,
    });

    return dialogRef.afterClosed$.pipe(
      map((result) => {
        if (result === 'override') {
          return audioTracks;
        }
        if (result === 'skip') {
          return audioTracks.filter((t) => !this.duplicateMap.has(t.fullPath));
        }
        return undefined;
      }),
    );
  }

  /**
   * Opens a confirmation dialog when the number of tracks being uploaded meets or exceeds the bulk threshold.
   * Allows the user to choose between reviewing files manually or autoresolving metadata.
   * Currently only the manual review path continues to the upload dialog.
   */
  private openBulkConfirmationDialog(audioTracks: AudioTrack[]): Observable<void> {
    const dialogRef = this.dialogService.open<
      BulkUploadConfirmationModalComponent,
      BulkUploadConfirmationModalResult
    >(BulkUploadConfirmationModalComponent, {
      data: { count: audioTracks.length } satisfies BulkUploadConfirmationModalData,
    });

    return dialogRef.afterClosed$.pipe(
      switchMap((result) => {
        if (result === 'manual') {
          return this.openUploadDialog(audioTracks);
        }
        return this.audioFilesService.uploadAudioTracks(audioTracks);
      }),
    );
  }

  /**
   * Opens a dialog to edit the provided audio tracks details. After confirmation, it uploads new tracks and overrides duplicates as needed.
   */
  private openUploadDialog(audioTracks: AudioTrack[]): Observable<void> {
    const dialog = this.dialogService.open<TracksUploadModalComponent, AudioTrack[] | null>(
      TracksUploadModalComponent,
      { data: { title: 'Upload Tracks', tracks: audioTracks } },
    );

    return dialog.afterClosed$.pipe(
      switchMap((confirmedTracks) => {
        if (!confirmedTracks?.length) {
          return EMPTY;
        }

        const duplicateTracks = confirmedTracks.filter((t) => this.duplicateMap.has(t.fullPath));
        const newTracks = confirmedTracks.filter((t) => !this.duplicateMap.has(t.fullPath));

        const override$ = duplicateTracks.length
          ? this.overrideTracks(duplicateTracks)
          : of(undefined);

        const upload$ = newTracks.length
          ? this.audioFilesService.uploadAudioTracks(newTracks)
          : of(undefined);

        return combineLatest([override$, upload$]).pipe(map(() => void 0));
      }),
    );
  }

  /**
   * Overrides existing tracks with the provided audio tracks. It updates the track details based on the new audio track information.
   * Uses the duplicateMap to find existing tracks and updates them with new details before sending update requests to the API.
   */
  private overrideTracks(tracks: AudioTrack[]): Observable<void> {
    const updateObservables = tracks
      .filter((t) => this.duplicateMap.has(t.fullPath))
      .map((t) => {
        const existingTrack = this.duplicateMap.get(t.fullPath) as Track;
        const updatedTrack: Track = {
          ...existingTrack,
          name: t.title,
          author: t.author,
          url: t.fullPath,
          duration: t.length,
          tags: t.tags,
        };
        return this.trackApiService.updateTrack(updatedTrack);
      });

    return combineLatest(updateObservables).pipe(map(() => void 0));
  }

  /**
   * Resets the internal state of the service by clearing the duplicateMap.
   * This is called after the upload sequence is completed to ensure that any stored duplicates from previous
   * operations do not affect future uploads.
   */
  private reset(): void {
    this.duplicateMap.clear();
  }
}
