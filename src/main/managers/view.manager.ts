import { BrowserWindow, WebContentsView, WebPreferences } from 'electron';
import path from 'node:path';
import { FrontendTab } from './tabs/frontend.tab';
import { TopBarTab } from './tabs/top-bar.tab';
import { SideBarTab } from './tabs/side-bar.tab';
import { BaseTab } from './tabs/base-tab';
import { AppChannel } from '@shared/models/channels.model';
import { StartupManager } from './startup.manager';

export class ViewManager {
  private static _instance: ViewManager | null = null;

  constructor(
    public appWindow: BrowserWindow,
    public captureTab: WebContentsView,
    public frontendTab: BaseTab,
    public topBarTab: BaseTab,
    public sideBarTab: BaseTab
  ) {}

  static async getInstance(config?: {
    width: number;
    height: number;
    defaultPreferences: Partial<WebPreferences>;
    indexHTML: string;
    env: string;
  }): Promise<ViewManager> {
    if (!ViewManager._instance && !config) {
      throw new Error('ViewManager needs to initialized with config first.');
    }

    if (!ViewManager._instance && config) {
      const appWindow = ViewManager.createWindow(
        config.width,
        config.height,
        config.defaultPreferences
      );
      ViewManager.setupAppWindow(appWindow);

      const captureTab = await ViewManager.createCaptureTab(
        appWindow,
        config.defaultPreferences,
        config.indexHTML
      );
      const serverUrl = StartupManager.tabsServerUrl;
      const frontendTab = await ViewManager.createAndLoadTab(
        () => new FrontendTab(appWindow, config.defaultPreferences),
        config.env,
        serverUrl
      );
      const topBarTab = await ViewManager.createAndLoadTab(
        () => new TopBarTab(appWindow, config.defaultPreferences),
        config.env,
        serverUrl
      );
      const sideBarTab = await ViewManager.createAndLoadTab(
        () => new SideBarTab(appWindow, config.defaultPreferences),
        config.env,
        serverUrl
      );

      if (config.env !== 'production') {
        frontendTab.tab.webContents.openDevTools({
          mode: 'detach',
        });
      }

      ViewManager._instance = new ViewManager(
        appWindow,
        captureTab,
        frontendTab,
        topBarTab,
        sideBarTab
      );
      ViewManager._instance.initializeEventListeners();
    }

    return this._instance!;
  }

  private static createWindow(
    width: number,
    height: number,
    defaultPreferences: Partial<WebPreferences>
  ): BrowserWindow {
    return new BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        ...defaultPreferences,
      },
      titleBarStyle: 'hidden',
    });
  }

  private static async createAndLoadTab<T extends BaseTab>(
    factory: () => T,
    env: string,
    serverUrl: string
  ): Promise<T> {
    const tab = factory();
    await tab.load(env, serverUrl);
    return tab;
  }

  private static async createCaptureTab(
    appWindow: BrowserWindow,
    defaultPreferences: Partial<WebPreferences>,
    indexHTML: string
  ): Promise<WebContentsView> {
    const capturePreload = path.join(
      __dirname,
      '../',
      'src',
      'sound-capture',
      'preload.js'
    );
    const captureTab = new WebContentsView({
      webPreferences: {
        ...defaultPreferences,
        preload: capturePreload,
      },
    });
    appWindow.contentView.addChildView(captureTab);
    await captureTab.webContents.loadFile(indexHTML);
    return captureTab;
  }

  private static setupAppWindow(appWindow: BrowserWindow) {
    appWindow.setMenu(null);
  }

  public get tabs(): BaseTab[] {
    return [this.frontendTab, this.topBarTab, this.sideBarTab];
  }

  public broadcast<T, V extends T[]>(
    channel: AppChannel,
    senderProcessId: number | null = null,
    ...data: V
  ): void {
    this.tabs.forEach((baseTab) => {
      if (baseTab.tab.webContents.getProcessId() === senderProcessId) {
        return;
      }
      baseTab.tab.webContents.send(channel, ...data);
    });
  }

  private initializeEventListeners(): void {
    const resizeEvents: string[] = [
      'will-resize',
      'enter-full-screen',
      'leave-full-screen',
      'maximize',
      'unmaximize',
      'enter-html-full-screen',
      'leave-html-full-screen',
    ];
    resizeEvents.forEach((event) => {
      this.appWindow.on(event as any, () => this.updateTabSizes());
    });
  }

  private updateTabSizes(): void {
    const appBounds = this.appWindow.getContentBounds();
    this.tabs.forEach((tab) => {
      tab.resize(appBounds);
    });
  }
}
