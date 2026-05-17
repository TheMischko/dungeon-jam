import { binding, then } from 'cucumber-tsflow';
import { TestContext } from '../../context/context';
import { BaseSteps } from '../base.steps';
import { BaseMainPage } from '../../pages/_base/base-main.page';
import { expect } from 'playwright/test';

@binding([TestContext])
export class MainSteps extends BaseSteps {
  protected page: BaseMainPage;

  constructor(protected context: TestContext) {
    super(context);
    this.page = new BaseMainPage(context);
  }

  @then('the page title should be {string}')
  async titleMatches(value: string) {
    await expect(this.page.pageTitle).toHaveText(value, {
      ignoreCase: true,
    });
  }
}
