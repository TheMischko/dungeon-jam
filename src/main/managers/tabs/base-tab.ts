import {
  WebContentsView,
  WebPreferences,
  Rectangle,
  BrowserWindow,
} from 'electron';

export class BaseTab {
  private _tab!: WebContentsView;
  get tab(): WebContentsView {
    return this._tab;
  }
  private set tab(tab: WebContentsView) {
    this._tab = tab;
  }

  constructor(parent: BrowserWindow, preferences: TabPreferences) {
    this.tab = new WebContentsView({
      webPreferences: {
        ...preferences,
      },
    });

    parent.contentView.addChildView(this.tab);
    this.resize(parent.getContentBounds());
  }

  mute(muted: boolean = true): void {
    this.tab.webContents.setAudioMuted(muted);
  }

  openDevTools(opened: boolean = true): void {
    if (!opened) {
      this.tab.webContents.closeDevTools();
      return;
    }
    this.tab.webContents.openDevTools();
  }

  async load(env: string, serverUrl: string): Promise<void> {
    return;
  }

  resize(bounds: Rectangle): void {
    return;
  }
}

export type TabPreferences = Partial<WebPreferences> | undefined;
