export class PlaylistLandingSelectors {
  static readonly CARD = '.grid-content .grid-item';
  static readonly CARD_TITLE = `.properties .title`;

  static readonly CARD_WITH_TEXT = (title: string) =>
    `${this.CARD}:has-text("${title}")`;
}
