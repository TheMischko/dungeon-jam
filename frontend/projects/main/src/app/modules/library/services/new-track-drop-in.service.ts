import { inject, Injectable } from '@angular/core';
import { AudioTrack, Track } from '@shared/models/track.model';
import { DialogService } from '../../../services/dialog.service';
import { TrackService } from '../../../services/track.service';
import {
  combineLatest,
  EMPTY,
  finalize,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
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
import { TagApiService } from '@general/services/tag-api.service';
import { TagData } from '@shared/models/tag.model';

const BULK_UPLOAD_THRESHOLD = 3;

@Injectable({
  providedIn: 'root',
})
export class NewTrackDropInService {
  private readonly dialogService = inject(DialogService);
  private readonly trackApiService = inject(TrackService);
  private readonly audioFilesService = inject(AudioFilesService);
  private readonly tagApiService = inject(TagApiService);

  private duplicateMap: Map<string, Track> = new Map();

  public startUploadSequence(audioTracks?: AudioTrack[]): Observable<Track[]> {
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

        return this.openCorrectUploadDialog(tracksToUpload);
      }),
      finalize(() => this.reset())
    );
  }

  /**
   * Determines which upload dialog to open based on the number of tracks being uploaded.
   * If the number of tracks meets or exceeds the defined bulk upload threshold, it opens a bulk confirmation dialog.
   * Otherwise, it opens the standard upload dialog.
   * @param tracksToUpload
   * @private
   */
  private openCorrectUploadDialog(
    tracksToUpload: AudioTrack[]
  ): Observable<Track[]> {
    return this.resolveTrackTags(tracksToUpload).pipe(
      switchMap((tagsMap) => {
        if (tracksToUpload.length >= BULK_UPLOAD_THRESHOLD) {
          return this.openBulkConfirmationDialog(tracksToUpload, tagsMap);
        }

        return this.openUploadDialog(tracksToUpload, tagsMap);
      })
    );
  }

  /**
   * Checks for duplicate tracks based on their full path and populates the duplicateMap with any found duplicates.
   *
   * Emits a boolean indicating whether any duplicates were found.
   */
  private checkDuplicateTracks(tracks: AudioTrack[]): Observable<boolean> {
    return this.trackApiService
      .findDuplicates(tracks.map((t) => t.fullPath))
      .pipe(
        tap((duplicates) => {
          duplicates
            .filter((d) => !!d.track)
            .forEach((d) => this.duplicateMap.set(d.path, d.track as Track));
        }),
        map((duplicates) => duplicates.some((d) => !!d.track))
      );
  }

  /**
   * Opens a dialog to inform the user about duplicate tracks and allows them to choose whether to override existing tracks or skip duplicates.
   */
  private openDuplicatesDialog(
    audioTracks: AudioTrack[]
  ): Observable<AudioTrack[] | undefined> {
    const duplicates = audioTracks
      .filter((t) => this.duplicateMap.has(t.fullPath))
      .map((t) => ({
        path: t.fullPath,
        track: this.duplicateMap.get(t.fullPath) as Track,
      }));

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
      })
    );
  }

  /**
   * Opens a confirmation dialog when the number of tracks being uploaded meets or exceeds the bulk threshold.
   * Allows the user to choose between reviewing files manually or autoresolving metadata.
   * Currently only the manual review path continues to the upload dialog.
   */
  private openBulkConfirmationDialog(
    audioTracks: AudioTrack[],
    tagsMap: Map<string, TagData>
  ): Observable<Track[]> {
    const dialogRef = this.dialogService.open<
      BulkUploadConfirmationModalComponent,
      BulkUploadConfirmationModalResult
    >(BulkUploadConfirmationModalComponent, {
      data: {
        count: audioTracks.length,
      } satisfies BulkUploadConfirmationModalData,
    });

    return dialogRef.afterClosed$.pipe(
      switchMap((result) => {
        if (!result) {
          return EMPTY;
        }
        if (result === 'manual') {
          return this.openUploadDialog(audioTracks, tagsMap);
        }
        const tracksWithTags = audioTracks.map((track) => {
          return {
            ...track,
            tags: track.tags?.map((t) => tagsMap?.get(t)?.id ?? t) ?? [],
          };
        });
        const newTracks = tracksWithTags.filter(
          (t) => !this.duplicateMap.has(t.fullPath)
        );
        const upload$ = newTracks.length
          ? this.audioFilesService.uploadAudioTracks(newTracks)
          : of<Track[]>([]);
        const override$ = this.overrideTracks(tracksWithTags);
        return combineLatest([upload$, override$]).pipe(
          map(([uploaded, overridden]) => [...uploaded, ...overridden])
        );
      })
    );
  }
  /**
   * Opens a dialog to edit the provided audio tracks details. After confirmation, it uploads new tracks and overrides duplicates as needed.
   */
  private openUploadDialog(
    audioTracks: AudioTrack[],
    tagsMap: Map<string, TagData>
  ): Observable<Track[]> {
    const dialog = this.dialogService.open<
      TracksUploadModalComponent,
      AudioTrack[] | null
    >(TracksUploadModalComponent, {
      data: { title: 'Upload Tracks', tracks: audioTracks, tagsMap },
    });

    return dialog.afterClosed$.pipe(
      switchMap((confirmedTracks) => {
        if (!confirmedTracks?.length) {
          return EMPTY;
        }

        const duplicateTracks = confirmedTracks.filter((t) =>
          this.duplicateMap.has(t.fullPath)
        );
        const newTracks = confirmedTracks.filter(
          (t) => !this.duplicateMap.has(t.fullPath)
        );

        const override$ = duplicateTracks.length
          ? this.overrideTracks(duplicateTracks)
          : of<Track[]>([]);

        const upload$ = newTracks.length
          ? this.audioFilesService.uploadAudioTracks(newTracks)
          : of<Track[]>([]);

        return combineLatest([override$, upload$]).pipe(
          map(([overridden, uploaded]) => [...overridden, ...uploaded])
        );
      })
    );
  }

  /**
   * Overrides existing tracks with the provided audio tracks. It updates the track details based on the new audio track information.
   * Uses the duplicateMap to find existing tracks and updates them with new details before sending update requests to the API.
   */
  private overrideTracks(tracks: AudioTrack[]): Observable<Track[]> {
    const updates = tracks
      .filter((t) => this.duplicateMap.has(t.fullPath))
      .map((t) => {
        const existingTrack = this.duplicateMap.get(t.fullPath) as Track;
        return {
          ...existingTrack,
          name: t.title,
          author: t.author,
          url: t.fullPath,
          duration: t.length,
          tags: t.tags,
        } as Track;
      });

    if (!updates.length) {
      return of([]);
    }

    return this.trackApiService.updateMultiple(updates).pipe(
      map(() => updates.map((u) => this.duplicateMap.get(u.url) ?? u))
    );
  }

  /**
   * Resolves the tags for the provided audio tracks by first collecting all unique tag labels, then fetching
   * existing tags from the API, and finally inserting any missing tags.
   *
   * It returns a map of tag labels to their corresponding TagData objects for easy reference during track uploading.
   * @param tracks
   * @private
   */
  private resolveTrackTags(
    tracks: AudioTrack[]
  ): Observable<Map<string, TagData>> {
    const allLabels = [...new Set(tracks.flatMap((t) => t.tags ?? []))];
    if (!allLabels.length) {
      return of(new Map());
    }
    return this.tagApiService.getSubsetOfTags('title', allLabels).pipe(
      switchMap((existingTags) => {
        const existingLabels = existingTags.map((t) => t.title);
        const missingLabels = allLabels.filter(
          (label) => !existingLabels.includes(label)
        );
        if (!missingLabels.length) {
          return of(new Map(existingTags.map((t) => [t.title, t])));
        }
        return combineLatest(
          missingLabels.map((label) =>
            this.tagApiService.insertTag({ title: label })
          )
        ).pipe(
          map(
            (newTags) =>
              new Map([...existingTags, ...newTags].map((t) => [t.title, t]))
          )
        );
      })
    );
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
