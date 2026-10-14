import { BasePage } from './base.page';
import { TestContext } from '../../context/context';
import { Locator, Page } from 'playwright';
import { MainSelectors } from '../../selectors/main/main.selectors';

export class BaseMainPage extends BasePage {
  get page(): Page {
    return this.context.windows.mainWindow;
  }
  constructor(protected context: TestContext) {
    super(context);
  }

  get pageTitle(): Locator {
    return this.page.locator(MainSelectors.PAGE_TITLE).first();
  }
}
