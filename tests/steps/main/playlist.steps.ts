import { binding, then } from 'cucumber-tsflow';
import { TestContext } from '../../context/context';
import { BaseSteps } from '../base.steps';
import { PlaylistLandingPage } from '../../pages/main/playlist-landing.page';
import { expect } from 'playwright/test';

@binding([TestContext])
export class PlaylistSteps extends BaseSteps {
  private page: PlaylistLandingPage;
  constructor(protected context: TestContext) {
    super(context);
    this.page = new PlaylistLandingPage(context);
  }

  @then('there should be playlist with name {string}')
  async playlistIsOnLandingPage(playlistName: string): Promise<void> {
    const playlistCard = this.page.getPlaylistCard(playlistName);
    await expect(playlistCard).toBeVisible();
  }
}
