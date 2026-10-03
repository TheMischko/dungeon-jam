import { BaseMainPage } from '../_base/base-main.page';
import { TestContext } from '../../context/context';
import { SettingsSelectors } from '../../selectors/main/settings.selectors';

export class SettingsPage extends BaseMainPage {
  constructor(protected context: TestContext) {
    super(context);
  }

  async clickCheckUpdates(): Promise<void> {
    const button = this.page.locator(SettingsSelectors.CHECK_UPDATES_BUTTON);
    await button.waitFor({ state: 'visible', timeout: 5000 });
    await button.click();
  }

  async isToastWithTextVisible(text: string, timeout = 5000): Promise<boolean> {
    const toast = this.page.locator(SettingsSelectors.TOAST_WRAPPER).filter({ hasText: text });
    try {
      await toast.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }
}
