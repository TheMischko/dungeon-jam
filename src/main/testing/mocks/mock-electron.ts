import {vi} from "vitest";

export const mockElectron = {
    app: {
      on: vi.fn(),
      quit: vi.fn(),
      getName: vi.fn(() => 'test-app'),
      getPath: vi.fn(() => '/test-path'),
    },
    ipcMain: {
      handle: vi.fn(),
      on: vi.fn(),
      send: vi.fn(),
      once: vi.fn(),
    },
    BrowserWindow: vi.fn(() => ({
      loadURL: vi.fn(),
      webContents: {
        send: vi.fn(),
      },
    })),
    WebContentsView: vi.fn(() => ({
      webContents: {
        loadURL: vi.fn(),
      },
    })),
}