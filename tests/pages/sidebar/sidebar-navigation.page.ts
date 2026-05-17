import { SidebarSelectors } from '../../selectors/sidebar/sidebar.selectors';
import { BaseSidebarPage } from '../_base/base-sidebar.page';
import { TestContext } from '../../context/context';

export class SidebarNavigationPage extends BaseSidebarPage {
  constructor(protected context: TestContext) {
    super(context);
  }

  async clickOnItem(itemText: string): Promise<void> {
    const items = this.sidebarPage.locator(SidebarSelectors.SIDEBAR_ITEM);
    const item = items.getByText(itemText, { exact: false });
    await item.click();
  }
}
