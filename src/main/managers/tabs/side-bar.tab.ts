import { BaseTab, TabPreferences } from './base-tab';
import { BrowserWindow } from 'electron';
import { getSideBarRect } from './tab-config';

export class SideBarTab extends BaseTab {
  constructor(parent: BrowserWindow, preferences: TabPreferences) {
    super(parent, preferences);
  }

  async load(env: string, serverUrl: string): Promise<void> {
    if (env === 'production' || env === 'test') {
      await this.tab.webContents.loadURL(`${serverUrl}/sidebar/index.html`);
      return;
    }
    await this.tab.webContents.loadURL('http://localhost:4201/');
  }

  resize(bounds: Electron.CrossProcessExports.Rectangle) {
    this.tab.setBounds(getSideBarRect(bounds.width, bounds.height));
  }
}
