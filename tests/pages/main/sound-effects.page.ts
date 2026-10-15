import { BaseMainPage } from '../_base/base-main.page';
import { TestContext } from '../../context/context';
import { SoundEffectsSelectors } from '../../selectors/main/sound-effects.selectors';
import { Locator } from 'playwright';

export class SoundEffectsPage extends BaseMainPage {
  constructor(protected context: TestContext) {
    super(context);
  }

  async clickCardPlay(effectName: string): Promise<void> {
    const card = this.page.locator(SoundEffectsSelectors.CARD_WITH_NAME(effectName)).first();
    await card.waitFor({ state: 'visible' });
    const btn = card.locator('lib-play-pause-button button').first();
    await btn.waitFor({ state: 'visible' });
    await btn.click();
  }

  getPillLocator(effectName: string): Locator {
    return this.page
      .locator(SoundEffectsSelectors.BAR_PILL_WITH_NAME(effectName))
      .first();
  }

  async clickPillStop(effectName: string): Promise<void> {
    const pill = this.getPillLocator(effectName);
    await pill.waitFor({ state: 'visible' });
    const stopBtn = pill.locator('app-sound-effect-pill-icon-button button').first();
    await stopBtn.waitFor({ state: 'visible' });
    await stopBtn.click();
  }
}
