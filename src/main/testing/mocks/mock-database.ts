export const mockDatabase = {
  DatabaseWrapper: {
    getInstance: vi.fn(() => Promise.resolve(mockDatabaseInstance)),
  },
};

export const mockDatabaseInstance = {
  readTable: vi.fn(),
  updateTable: vi.fn(),
};
