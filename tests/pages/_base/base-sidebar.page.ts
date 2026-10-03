import { BasePage } from './base.page';
import { TestContext } from '../../context/context';
import { Page } from 'playwright';

export class BaseSidebarPage extends BasePage {
  get page(): Page {
    return this.context.windows.sidebarWindow;
  }
  constructor(protected context: TestContext) {
    super(context);
  }
}
