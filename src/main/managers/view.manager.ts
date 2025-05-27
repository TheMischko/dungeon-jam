import { BrowserWindow, WebContentsView, WebPreferences } from 'electron';
import path from 'node:path';

export class ViewManager {
  private static SIDEBAR_WIDTH = 0.3;
  private static TOPBAR_HEIGHT = 0.1;

  constructor(
    public appWindow: BrowserWindow,
    public captureTab: WebContentsView,
    public frontendTab: WebContentsView,
    public topBarTab: WebContentsView,
    public sideBarTab: WebContentsView,
  ) {}

  static async create(
    width: number,
    height: number,
    defaultPreferences: Partial<WebPreferences>,
    indexHTML: string,
  ): Promise<ViewManager> {
    const appWindow = new BrowserWindow({
      width,
      height,
      webPreferences: {
        ...defaultPreferences,
      },
    });

    const captureTab = new WebContentsView({
      webPreferences: {
        ...defaultPreferences,
      },
    });
    appWindow.contentView.addChildView(captureTab);
    await captureTab.webContents.loadURL(indexHTML);

    const topBarHeight = height * ViewManager.TOPBAR_HEIGHT;
    const topBarTab = new WebContentsView({
      webPreferences: {
        ...defaultPreferences,
      },
    });
    appWindow.contentView.addChildView(topBarTab);
    topBarTab.setBounds({ x: 0, y: 0, width, height: topBarHeight });

    const sideBarWidth = width * ViewManager.SIDEBAR_WIDTH;
    const sideBarTab = new WebContentsView({
      webPreferences: {
        ...defaultPreferences,
      },
    });
    appWindow.contentView.addChildView(sideBarTab);
    sideBarTab.setBounds({
      x: 0,
      y: topBarHeight,
      width: sideBarWidth,
      height: height - topBarHeight,
    });

    const frontendTab = new WebContentsView({
      webPreferences: {
        ...defaultPreferences,
      },
    });
    frontendTab.webContents.openDevTools();
    frontendTab.webContents.setAudioMuted(true);
    appWindow.contentView.addChildView(frontendTab);
    frontendTab.setBounds({
      x: sideBarWidth,
      y: topBarHeight,
      width: width - sideBarWidth,
      height: height - topBarHeight,
    });

    await frontendTab.webContents.loadURL('http://localhost:4200/');
    await sideBarTab.webContents.loadURL('http://localhost:4201/');
    await topBarTab.webContents.loadURL('http://localhost:4202/');

    return new ViewManager(
      appWindow,
      captureTab,
      frontendTab,
      topBarTab,
      sideBarTab,
    );
  }
}
