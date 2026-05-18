import { BasePage } from './base.page';
import { TestContext } from '../../context/context';
import { Locator, Page } from 'playwright';
import { MainSelectors } from '../../selectors/main/main.selectors';

export class BaseMainPage extends BasePage {
  public readonly page: Page;
  constructor(protected context: TestContext) {
    super(context);
    this.page = context.windows.mainWindow;
  }

  get pageTitle(): Locator {
    return this.page.locator(MainSelectors.PAGE_TITLE).first();
  }
}
