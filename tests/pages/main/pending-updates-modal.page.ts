import { Locator } from 'playwright';
import { TestContext } from '../../context/context';
import { BaseMainPage } from '../_base/base-main.page';
import { PendingUpdatesModalSelectors } from '../../selectors/main/pending-updates-modal.selectors';

export class PendingUpdatesModalPage extends BaseMainPage {
  constructor(protected context: TestContext) {
    super(context);
  }

  get modal(): Locator {
    return this.page.locator(PendingUpdatesModalSelectors.MODAL);
  }

  get header(): Locator {
    return this.page.locator(PendingUpdatesModalSelectors.HEADER);
  }

  get version(): Locator {
    return this.page.locator(PendingUpdatesModalSelectors.VERSION);
  }

  get notes(): Locator {
    return this.page.locator(PendingUpdatesModalSelectors.NOTES);
  }

  get installButton(): Locator {
    return this.page.locator(PendingUpdatesModalSelectors.INSTALL_BUTTON);
  }

  get cancelButton(): Locator {
    return this.page.locator(PendingUpdatesModalSelectors.CANCEL_BUTTON);
  }

  async isModalVisible(): Promise<boolean> {
    return await this.modal.isVisible();
  }

  async waitForModalVisible(timeout = 5000): Promise<void> {
    await this.modal.waitFor({ state: 'visible', timeout });
  }

  async waitForModalHidden(timeout = 5000): Promise<void> {
    await this.modal.waitFor({ state: 'hidden', timeout });
  }

  async getVersionText(): Promise<string> {
    return (await this.version.innerText()).trim();
  }

  async clickInstall(): Promise<void> {
    await this.installButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
