export class LibraryLandingSelectors {
  static readonly DROP_ZONE = '.drop-zone-wrapper';
  static readonly TRACK_ROW_WITH_TITLE = (title: string) =>
    `mat-row:has-text("${title}")`;
  static readonly UPLOAD_MODAL_STEP_BUTTON = (text: 'Next' | 'Finish') =>
    `button:has-text("${text}")`;
}
