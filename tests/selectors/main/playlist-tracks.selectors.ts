export class PlaylistTracksSelectors {
  static readonly ADD_TRACKS_BUTTON = 'button:has-text("Add tracks from library")';
  static readonly MODAL_OVERLAY = 'div.cdk-overlay-container';

  static readonly MODAL_ROW_WITH_TEXT = (title: string) =>
    `${PlaylistTracksSelectors.MODAL_OVERLAY} mat-row:has-text("${title}")`;

  static readonly MODAL_SAVE_BUTTON = `${PlaylistTracksSelectors.MODAL_OVERLAY} button:has-text("Save")`;

  static readonly DETAIL_TRACK_ROW_WITH_TEXT = (title: string) =>
    `div.content mat-row:has-text("${title}")`;
}
