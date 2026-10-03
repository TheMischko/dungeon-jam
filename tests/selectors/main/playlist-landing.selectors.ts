export class PlaylistLandingSelectors {
  static readonly CARD = 'app-playlist-grid-item .grid-item';
  static readonly CARD_TITLE = `.properties .title`;

  static readonly CARD_WITH_TEXT = (title: string) =>
    `app-playlist-grid-item:has-text("${title}") .grid-item`;

  static readonly CARD_PLAY_BUTTON = (title: string) =>
    `app-playlist-grid-item:has-text("${title}") .hover-overlay svg`;
}

