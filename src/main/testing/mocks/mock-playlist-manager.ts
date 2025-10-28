import { vi } from 'vitest';

export const mockPlaylistManager = {
  PlaylistManager: {
    getInstance: vi.fn(async () => {
      return Promise.resolve(mockPlaylistManagerInstance);
    }),
  },
};

export const mockPlaylistManagerInstance = {
  getById: vi.fn(),
};
