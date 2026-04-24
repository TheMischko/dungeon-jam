import { BaseTab, TabPreferences } from './base-tab';
import { BrowserWindow } from 'electron';
import { getMainTabRect } from './tab-config';

export class FrontendTab extends BaseTab {
  constructor(parent: BrowserWindow, preferences: TabPreferences) {
    super(parent, preferences);
  }

  async load(env: string, serverUrl: string): Promise<void> {
    if (env === 'production') {
      await this.tab.webContents.loadURL(`${serverUrl}/main/index.html`);
      return;
    }
    await this.tab.webContents.loadURL('http://localhost:4200/');
  }

  resize(bounds: Electron.CrossProcessExports.Rectangle) {
    this.tab.setBounds(getMainTabRect(bounds.width, bounds.height));
  }
}
