export class SoundEffectsSelectors {
  static readonly CARD_WITH_NAME = (name: string) =>
    `app-sound-effect-card:has-text("${name}")`;
  static readonly CARD_PLAY_BUTTON = (name: string) =>
    `app-sound-effect-card:has-text("${name}") lib-play-pause-button button`;
  static readonly BAR_PILL_WITH_NAME = (name: string) =>
    `app-sound-effect-bar-pill:has-text("${name}")`;
  static readonly BAR_PILL_STOP_BUTTON = (name: string) =>
    `app-sound-effect-bar-pill:has-text("${name}") app-sound-effect-pill-icon-button button`;
  static readonly CONTROL_PILL_STOP_ALL_BUTTON =
    'app-sound-effect-control-pill app-sound-effect-pill-icon-button button';
}
