import {vi} from "vitest";

export const mockViewManagerInstance = {
  broadcast: vi.fn(),
  createWindow: vi.fn(),
  getWindow: vi.fn(),
}

export const mockViewManager= {
      ViewManager: {
        getInstance: vi.fn(async () => mockViewManagerInstance)
    }
}

