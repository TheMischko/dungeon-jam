import { BaseMainPage } from '../_base/base-main.page';
import { TestContext } from '../../context/context';
import { Locator } from 'playwright';
import { PlayerSelectors } from '../../selectors/main/player.selectors';

export class PlayerPage extends BaseMainPage {
  constructor(protected context: TestContext) {
    super(context);
  }

  getActiveTrackNameLocator(): Locator {
    return this.page.locator(PlayerSelectors.ACTIVE_TRACK_NAME).first();
  }

  async clickPlayPause(): Promise<void> {
    const btn = this.page.locator(PlayerSelectors.PLAY_PAUSE_BUTTON).first();
    await btn.waitFor({ state: 'visible' });
    await btn.click();
  }

  async clickNext(): Promise<void> {
    const btn = this.page.locator(PlayerSelectors.NEXT_BUTTON).first();
    await btn.waitFor({ state: 'visible' });
    await btn.click();
  }

  async clickPrev(): Promise<void> {
    const btn = this.page.locator(PlayerSelectors.PREV_BUTTON).first();
    await btn.waitFor({ state: 'visible' });
    await btn.click();
  }

  async setVolume(value: number): Promise<void> {
    const input = this.page.locator(PlayerSelectors.VOLUME_SLIDER_INPUT).first();
    await input.waitFor({ state: 'attached' });
    await input.evaluate((el: HTMLInputElement, val: number) => {
      el.value = val.toString();
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
  }

  getVolumeIconLocator(): Locator {
    return this.page.locator(PlayerSelectors.VOLUME_ICON).first();
  }
}
