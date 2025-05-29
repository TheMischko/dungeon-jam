import {
  BrowserWindow,
  Rectangle,
  WebContentsView,
  WebPreferences,
  WillResizeDetails,
} from 'electron';
import path from 'node:path';
import { FrontendTab } from './tabs/frontend.tab';
import { TopBarTab } from './tabs/top-bar.tab';
import { SideBarTab } from './tabs/side-bar.tab';
import { BaseTab } from './tabs/base-tab';

export class ViewManager {
  private static _instance: ViewManager | null = null;

  constructor(
    public appWindow: BrowserWindow,
    public captureTab: WebContentsView,
    public frontendTab: BaseTab,
    public topBarTab: BaseTab,
    public sideBarTab: BaseTab,
  ) {}

  static async getInstance(config?: {
    width: number;
    height: number;
    defaultPreferences: Partial<WebPreferences>;
    indexHTML: string;
  }): Promise<ViewManager> {
    if (!ViewManager._instance && !config) {
      throw new Error('ViewManager needs to initialized with config first.');
    }

    if (!ViewManager._instance && config) {
      const appWindow = ViewManager.createWindow(
        config.width,
        config.height,
        config.defaultPreferences,
      );
      const captureTab = await ViewManager.createCaptureTab(
        appWindow,
        config.defaultPreferences,
        config.indexHTML,
      );
      const frontendTab = await ViewManager.createAndLoadTab(
        () => new FrontendTab(appWindow, config.defaultPreferences),
      );
      const topBarTab = await ViewManager.createAndLoadTab(
        () => new TopBarTab(appWindow, config.defaultPreferences),
      );
      const sideBarTab = await ViewManager.createAndLoadTab(
        () => new SideBarTab(appWindow, config.defaultPreferences),
      );

      ViewManager._instance = new ViewManager(
        appWindow,
        captureTab,
        frontendTab,
        topBarTab,
        sideBarTab,
      );
      ViewManager._instance.initializeEventListeners();
    }

    return this._instance!;
  }

  private static createWindow(
    width: number,
    height: number,
    defaultPreferences: Partial<WebPreferences>,
  ): BrowserWindow {
    const appWindow = new BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        ...defaultPreferences,
      },
    });
    return appWindow;
  }

  private static async createAndLoadTab<T extends BaseTab>(
    factory: () => T,
  ): Promise<T> {
    const tab = factory();
    await tab.load();
    return tab;
  }

  private static async createCaptureTab(
    appWindow: BrowserWindow,
    defaultPreferences: Partial<WebPreferences>,
    indexHTML: string,
  ): Promise<WebContentsView> {
    const capturePreload = path.join(
      __dirname,
      '../',
      '../',
      'sound-capture',
      'preload.js',
    );
    const captureTab = new WebContentsView({
      webPreferences: {
        ...defaultPreferences,
        preload: capturePreload,
      },
    });
    appWindow.contentView.addChildView(captureTab);
    await captureTab.webContents.loadURL(indexHTML);
    return captureTab;
  }

  public get tabs(): BaseTab[] {
    return [this.frontendTab, this.topBarTab, this.sideBarTab];
  }

  private initializeEventListeners(): void {
    this.appWindow.on(
      'will-resize',
      (event, newBounds: Rectangle, details: WillResizeDetails) => {
        this.tabs.forEach((tab) => {
          tab.resize(newBounds);
        });
      },
    );
  }
}
