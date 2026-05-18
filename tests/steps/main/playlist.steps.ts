import { binding, given, then } from 'cucumber-tsflow';
import { TestContext } from '../../context/context';
import { BaseSteps } from '../base.steps';
import { PlaylistInsertQuery } from '@shared/models/playlist.model';
import { createPlaylist } from '../../apis/playlists.api';
import { PlaylistLandingPage } from '../../pages/main/playlist-landing.page';
import { expect } from 'playwright/test';

@binding([TestContext])
export class PlaylistSteps extends BaseSteps {
  private page: PlaylistLandingPage;
  constructor(protected context: TestContext) {
    super(context);
    this.page = new PlaylistLandingPage(context);
  }

  @given('there is a playlist prepared called {string}')
  async preparePlaylist(playlistName: string): Promise<void> {
    const playlistData: PlaylistInsertQuery = {
      name: playlistName,
      tags: [],
    };

    await createPlaylist(this.page.page, playlistData);
  }

  @then('there should be playlist with name {string}')
  async playlistIsOnLandingPage(playlistName: string): Promise<void> {
    const playlistCard = this.page.getPlaylistCard(playlistName);
    await expect(playlistCard).toBeVisible();
  }
}
