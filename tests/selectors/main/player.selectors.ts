export class PlayerSelectors {
  static readonly CONTAINER = 'app-player';
  static readonly ACTIVE_TRACK_NAME =
    'app-player .player-content .info p:first-child';
  static readonly PLAY_PAUSE_BUTTON = 'app-player lib-play-pause-button button';
  static readonly PREV_BUTTON =
    'app-player .controls .buttons > lib-icon-button:first-of-type button';
  static readonly NEXT_BUTTON =
    'app-player .controls .buttons > lib-icon-button:last-of-type button';
  static readonly VOLUME_SLIDER_INPUT =
    'app-player app-volume-control mat-slider input';
  static readonly VOLUME_ICON =
    'app-player app-volume-control svg.side-icon';
}

