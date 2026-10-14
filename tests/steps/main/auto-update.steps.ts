import { binding, given, then, when } from 'cucumber-tsflow';
import { TestContext } from '../../context/context';
import { BaseSteps } from '../base.steps';
import { PendingUpdatesModalPage } from '../../pages/main/pending-updates-modal.page';
import { SettingsPage } from '../../pages/main/settings.page';
import { MockUpdateServer } from '../../utils/mock-update-server';
import { expect } from 'playwright/test';
import { getUpdatePreferences } from '../../apis/update.api';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.join(__dirname, '../../../build/src/db_test.json');

@binding([TestContext])
export class AutoUpdateSteps extends BaseSteps {
  private modalPage: PendingUpdatesModalPage;
  private settingsPage: SettingsPage;
  private mockServer = MockUpdateServer.getInstance();

  constructor(protected context: TestContext) {
    super(context);
    this.modalPage = new PendingUpdatesModalPage(this.context);
    this.settingsPage = new SettingsPage(this.context);
  }

  @given('an update to version {string} is available')
  async setAvailableUpdate(version: string): Promise<void> {
    this.mockServer.setAvailableRelease({ version });
  }

  @given(
    'an update to version {string} is available with notes {string}'
  )
  async setAvailableUpdateWithNotes(
    version: string,
    notes: string
  ): Promise<void> {
    this.mockServer.setAvailableRelease({ version, notes });
  }

  @given('no updates are available on update server')
  async setNoUpdates(): Promise<void> {
    this.mockServer.setAvailableRelease(null);
  }

  @given('the user previously skipped version {string}')
  async setPreviouslySkippedVersion(version: string): Promise<void> {
    let dbContent: any = {};
    if (fs.existsSync(dbPath)) {
      dbContent = JSON.parse(await fs.promises.readFile(dbPath, 'utf-8'));
    }
    dbContent.updatePreferences = {
      skippedVersion: version,
      skippedVersionDate: new Date().toISOString(),
    };
    await fs.promises.writeFile(
      dbPath,
      JSON.stringify(dbContent, null, 2),
      'utf-8'
    );
  }

  @when('the application is started')
  @when('the application is reloaded')
  @when('the application checks for updates')
  async triggerAppReload(): Promise<void> {
    await this.restartApplication();
  }

  @when('the application is restarted')
  async triggerAppRestart(): Promise<void> {
    await this.restartApplication();
  }

  @when('the application is restarted with version {string}')
  async triggerAppRestartWithVersion(version: string): Promise<void> {
    await this.restartApplication({ TEST_APP_VERSION: version });
  }

  @then('the update server should have received update check request')
  async verifyServerCheckRequest(): Promise<void> {
    expect(this.mockServer.checkRequestsCount).toBeGreaterThan(0);
  }

  @then('the "New update available" modal should be visible')
  @then('the update modal should be visible')
  async verifyModalVisible(): Promise<void> {
    await this.modalPage.waitForModalVisible();
    await expect(this.modalPage.modal).toBeVisible();
  }

  @then('the update modal should display version {string}')
  async verifyModalVersion(expectedVersion: string): Promise<void> {
    await expect(this.modalPage.version).toContainText(expectedVersion);
  }

  @when('the user clicks on {string} in update modal')
  @when('the user clicks {string} in the update modal')
  async clickModalButton(buttonLabel: string): Promise<void> {
    if (buttonLabel.toLowerCase().includes('cancel')) {
      await this.modalPage.clickCancel();
    } else {
      await this.modalPage.clickInstall();
    }
  }

  @then('the update modal should be closed')
  @then('the update modal should not be displayed')
  async verifyModalNotDisplayed(): Promise<void> {
    await this.modalPage.waitForModalHidden();
    await expect(this.modalPage.modal).toBeHidden();
  }

  @then('the skipped version in preferences should be {string}')
  async verifySkippedVersion(expectedVersion: string): Promise<void> {
    const preferences = await getUpdatePreferences(
      this.context.windows.mainWindow
    );
    expect(preferences?.skippedVersion).toBe(expectedVersion);
  }

  @then('the update preferences should be empty')
  async verifyEmptyPreferences(): Promise<void> {
    const preferences = await getUpdatePreferences(
      this.context.windows.mainWindow
    );
    expect(preferences?.skippedVersion).toBeUndefined();
  }

  @when('the user clicks on "Check updates" in settings')
  async clickCheckUpdatesInSettings(): Promise<void> {
    await this.settingsPage.clickCheckUpdates();
  }

  @then('a notification stating {string} should be displayed')
  async verifyNotificationWithText(text: string): Promise<void> {
    const isVisible = await this.settingsPage.isToastWithTextVisible(text);
    expect(isVisible).toBe(true);
  }
}
