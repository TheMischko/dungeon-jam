import { BaseMainPage } from '../_base/base-main.page';
import { TestContext } from '../../context/context';
import { Locator } from 'playwright';
import { PlaylistLandingSelectors } from '../../selectors/main/playlist-landing.selectors';

export class PlaylistLandingPage extends BaseMainPage {
  constructor(protected context: TestContext) {
    super(context);
  }

  getPlaylistCard(playlistName: string): Locator {
    return this.page
      .locator(PlaylistLandingSelectors.CARD_WITH_TEXT(playlistName))
      .first();
  }
}
