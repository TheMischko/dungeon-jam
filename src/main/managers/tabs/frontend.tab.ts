import { BaseTab, TabPreferences } from './base-tab';
import { BrowserWindow, WebContentsView } from 'electron';
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

    // const youtube = new WebContentsView();
    // this.parent.contentView.addChildView(youtube);
    //
    // const bounds = this.tab.getBounds();
    // youtube.setBounds({
    //   x: bounds.x,
    //   y: bounds.y + 50,
    //   width: bounds.width,
    //   height: bounds.height - 50,
    // });
    // await youtube.webContents.loadURL('https://youtube.com');
    // youtube.webContents.focus();
  }

  resize(bounds: Electron.CrossProcessExports.Rectangle) {
    this.tab.setBounds(getMainTabRect(bounds.width, bounds.height));
  }
}
