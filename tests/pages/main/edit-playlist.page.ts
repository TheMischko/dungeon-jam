import { Locator } from 'playwright';
import { TestContext } from '../../context/context';
import { BaseMainPage } from '../_base/base-main.page';
import { EditPlaylistSelectors } from '../../selectors/main/edit-playlist.selectors';

export class EditPlaylistPage extends BaseMainPage {
  constructor(protected context: TestContext) {
    super(context);
  }

  async clickOpenButton(): Promise<void> {
    await this.page.locator(EditPlaylistSelectors.OPEN_BUTTON).click();
  }

  getNameInput(): Locator {
    return this.page
      .locator(EditPlaylistSelectors.MODAL)
      .getByLabel(EditPlaylistSelectors.NAME_INPUT_LABEL);
  }

  async fillName(name: string): Promise<void> {
    await this.getNameInput().fill(name);
  }

  async clickSave(): Promise<void> {
    await this.page.locator(EditPlaylistSelectors.SAVE_BUTTON).click();
  }
}
