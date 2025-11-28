import { vi } from 'vitest';

export const mockTagsManagerInstance = {
  getSubset: vi.fn().mockResolvedValue([]),
};

export const mockTagsManager = {
  TagsManager: class {
    static async getInstance() {
      return mockTagsManagerInstance;
    }
  },
};
