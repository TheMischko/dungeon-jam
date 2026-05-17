import { BasePage } from './base.page';
import { TestContext } from '../../context/context';
import { Page } from 'playwright';

export class BaseSidebarPage extends BasePage {
  protected sidebarPage: Page;
  constructor(protected context: TestContext) {
    super(context);
    this.sidebarPage = context.windows.sidebarWindow;
  }
}
