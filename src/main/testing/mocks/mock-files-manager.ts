import { vi } from 'vitest';

export const mockFilesManagerInstance = {
  updateTrackFile: vi.fn().mockResolvedValue(undefined),
  trackFileExists: vi.fn().mockResolvedValue(true),
};

export const mockFilesManager = {
  FilesManager: class {
    static async getInstance() {
      return mockFilesManagerInstance;
    }
  },
};
