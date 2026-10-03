import { binding, then, when } from 'cucumber-tsflow';
import { expect } from 'playwright/test';
import { TestContext } from '../../context/context';
import { BaseSteps } from '../base.steps';
import { SoundEffectsPage } from '../../pages/main/sound-effects.page';

@binding([TestContext])
export class SoundEffectsSteps extends BaseSteps {
  private soundEffectsPage: SoundEffectsPage;

  constructor(protected context: TestContext) {
    super(context);
    this.soundEffectsPage = new SoundEffectsPage(context);
  }

  @when('the user clicks play on sound effect card {string}')
  async playSoundEffectFromCard(effectName: string): Promise<void> {
    await this.soundEffectsPage.clickCardPlay(effectName);
    await this.context.windows.mainWindow.waitForTimeout(300);
  }

  @then('the sound effect pill {string} should appear in bottom player')
  async assertSoundEffectPillVisible(effectName: string): Promise<void> {
    const pill = this.soundEffectsPage.getPillLocator(effectName);
    await expect(pill).toBeVisible({ timeout: 5000 });
  }

  @then('the sound effect pill {string} should not be visible in bottom player')
  async assertSoundEffectPillNotVisible(effectName: string): Promise<void> {
    const pill = this.soundEffectsPage.getPillLocator(effectName);
    await expect(pill).not.toBeVisible({ timeout: 5000 });
  }

  @when('the user stops sound effect {string} via pill button')
  @when('the user stops sound effect {string} via pill')
  async stopSoundEffectFromPill(effectName: string): Promise<void> {
    await this.soundEffectsPage.clickPillStop(effectName);
    await this.context.windows.mainWindow.waitForTimeout(300);
  }
}
