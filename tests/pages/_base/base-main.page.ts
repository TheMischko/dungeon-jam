import { BasePage } from './base.page';
import { TestContext } from '../../context/context';
import { Locator, Page } from 'playwright';
import { MainSelectors } from '../../selectors/main/main.selectors';

export class BaseMainPage extends BasePage {
  protected mainPage: Page;
  constructor(protected context: TestContext) {
    super(context);
    this.mainPage = context.windows.mainWindow;
  }

  get pageTitle(): Locator {
    return this.mainPage.locator(MainSelectors.PAGE_TITLE).first();
  }
}
