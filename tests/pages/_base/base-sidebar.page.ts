import { BasePage } from './base.page';
import { TestContext } from '../../context/context';
import { Page } from 'playwright';

export class BaseSidebarPage extends BasePage {
  public readonly page: Page;
  constructor(protected context: TestContext) {
    super(context);
    this.page = context.windows.sidebarWindow;
  }
}
