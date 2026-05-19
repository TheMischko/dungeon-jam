import { binding, then, when } from 'cucumber-tsflow';
import { expect } from 'playwright/test';
import { TestContext } from '../../context/context';
import { BaseSteps } from '../base.steps';
import { PlaylistTracksPage } from '../../pages/main/playlist-tracks.page';

@binding([TestContext])
export class PlaylistTracksSteps extends BaseSteps {
  private page: PlaylistTracksPage;

  constructor(protected context: TestContext) {
    super(context);
    this.page = new PlaylistTracksPage(context);
  }

  @when('the user opens the playlist detail for {string}')
  async openPlaylistDetail(playlistName: string): Promise<void> {
    await this.page.openPlaylistDetail(playlistName);
  }

  @when('the user clicks "Add tracks from library" on the playlist detail page')
  async clickAddTracksFromLibrary(): Promise<void> {
    await this.page.clickAddTracksFromLibrary();
  }

  @when('the user selects the track {string} in the select tracks modal')
  async selectTrackInModal(title: string): Promise<void> {
    await this.page.selectTrackInModal(title);
  }

  @when('the user clicks save in the select tracks modal')
  async clickSaveInModal(): Promise<void> {
    await this.page.clickSaveInModal();
  }

  @then('the playlist detail page should display the track {string}')
  async detailPageShowsTrack(title: string): Promise<void> {
    const row = this.page.getDetailTrackRow(title);
    await expect(row).toBeVisible();
  }
}
