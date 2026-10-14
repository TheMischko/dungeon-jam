import { Locator } from 'playwright';
import { TestContext } from '../../context/context';
import { BaseMainPage } from '../_base/base-main.page';
import { PlaylistLandingSelectors } from '../../selectors/main/playlist-landing.selectors';
import { PlaylistTracksSelectors } from '../../selectors/main/playlist-tracks.selectors';

export class PlaylistTracksPage extends BaseMainPage {
  constructor(protected context: TestContext) {
    super(context);
  }

  async openPlaylistDetail(playlistName: string): Promise<void> {
    await this.page
      .locator(PlaylistLandingSelectors.CARD_WITH_TEXT(playlistName))
      .first()
      .click();
  }

  async clickAddTracksFromLibrary(): Promise<void> {
    await this.page.locator(PlaylistTracksSelectors.ADD_TRACKS_BUTTON).click();
  }

  async selectTrackInModal(title: string): Promise<void> {
    const row = this.page
      .locator(PlaylistTracksSelectors.MODAL_ROW_WITH_TEXT(title))
      .first();
    await row.waitFor({ state: 'visible' });
    await row.locator('mat-checkbox').click();
  }

  async clickSaveInModal(): Promise<void> {
    await this.page.locator(PlaylistTracksSelectors.MODAL_SAVE_BUTTON).click();
    await this.page
      .locator(PlaylistTracksSelectors.MODAL_OVERLAY + ' .mat-mdc-dialog-container')
      .waitFor({ state: 'detached', timeout: 5000 })
      .catch(() => {});
  }


  getDetailTrackRow(title: string): Locator {
    return this.page
      .locator(PlaylistTracksSelectors.DETAIL_TRACK_ROW_WITH_TEXT(title))
      .first();
  }

  async clickPlayPlaylist(): Promise<void> {
    const playBtn = this.page.locator(
      PlaylistTracksSelectors.PLAYLIST_HEADER_PLAY_BUTTON
    );
    await playBtn.waitFor({ state: 'visible' });
    await playBtn.click();
  }
}

