import { BaseTab, TabPreferences } from './base-tab';
import { BrowserWindow } from 'electron';
import { getTopBarRect } from './tab-config';

export class TopBarTab extends BaseTab {
  constructor(parent: BrowserWindow, preferences: TabPreferences) {
    super(parent, preferences);
  }

  async load(): Promise<void> {
    await this.tab.webContents.loadURL('http://localhost:4202/');
  }

  resize(bounds: Electron.CrossProcessExports.Rectangle) {
    this.tab.setBounds(getTopBarRect(bounds.width, bounds.height));
  }
}
