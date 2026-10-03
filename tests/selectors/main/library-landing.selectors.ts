export class LibraryLandingSelectors {
  static readonly DROP_ZONE = '.drop-zone-wrapper';
  static readonly SEARCH_INPUT = 'app-library-landing-page lib-search-bar input';
  static readonly TRACK_ROWS = 'app-library-landing-page app-songs-table mat-row';
  static readonly TRACK_ROW_WITH_TITLE = (title: string) =>
    `app-library-landing-page app-songs-table mat-row:has-text("${title}")`;
  static readonly NO_DATA_MESSAGE =
    'app-library-landing-page app-smart-table .no-data';
  static readonly UPLOAD_MODAL_STEP_BUTTON = (text: 'Next' | 'Finish') =>
    `button:has-text("${text}")`;
}
