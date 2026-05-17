import { SidebarNavigationPage } from '../../pages/sidebar/sidebar-navigation.page';
import { BaseSteps } from '../base.steps';
import { binding, when } from 'cucumber-tsflow';
import { TestContext } from '../../context/context';

@binding([TestContext])
export class SidebarSteps extends BaseSteps {
  private sidebarNavigationPage: SidebarNavigationPage;

  constructor(protected context: TestContext) {
    super(context);
    this.sidebarNavigationPage = new SidebarNavigationPage(this.context);
  }

  @when('the user clicks on {string} in navigation menu')
  async clickOnMenu(menuText: string): Promise<void> {
    await this.sidebarNavigationPage.clickOnItem(menuText);
  }
}
