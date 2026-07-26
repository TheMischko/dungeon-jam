import { binding, when } from 'cucumber-tsflow';
import { TestContext } from '../../context/context';
import { BaseSteps } from '../base.steps';
import { EditPlaylistPage } from '../../pages/main/edit-playlist.page';

@binding([TestContext])
export class EditPlaylistSteps extends BaseSteps {
  private page: EditPlaylistPage;

  constructor(protected context: TestContext) {
    super(context);
    this.page = new EditPlaylistPage(context);
  }

  @when('the user opens create playlist modal')
  async openCreatePlaylistModal(): Promise<void> {
    await this.page.clickOpenButton();
  }

  @when('the user enters {string} as playlist name in create playlist modal')
  async enterPlaylistName(playlistName: string): Promise<void> {
    await this.page.fillName(playlistName);
  }

  @when('the user clicks on save in create playlist modal')
  async clickSave(): Promise<void> {
    await this.page.clickSave();
  }
}
