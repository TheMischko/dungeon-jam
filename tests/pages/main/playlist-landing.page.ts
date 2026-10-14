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

  async hoverPlaylistCard(playlistName: string): Promise<void> {
    const card = this.getPlaylistCard(playlistName);
    await card.waitFor({ state: 'visible' });
    await card.hover();
  }

  async clickPlaylistCardPlayButton(playlistName: string): Promise<void> {
    await this.hoverPlaylistCard(playlistName);
    const playBtn = this.page
      .locator(PlaylistLandingSelectors.CARD_PLAY_BUTTON(playlistName))
      .first();
    await playBtn.waitFor({ state: 'visible' });
    await playBtn.click();
  }
}

