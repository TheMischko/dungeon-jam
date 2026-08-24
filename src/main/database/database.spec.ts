import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import path from 'path';
import fs from 'fs';
import { DatabaseWrapper } from './database';

const mockUserDataPath = path.join(__dirname, 'test_user_data');

vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => {
      if (name === 'userData') {
        return mockUserDataPath;
      }
      return __dirname;
    },
  },
}));

describe('DatabaseWrapper Temp Mode', () => {
  const originalEnv = process.env.TEMP_DB;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalArgv = [...process.argv];

  beforeEach(() => {
    DatabaseWrapper.resetInstance();
    delete process.env.TEMP_DB;
    process.argv = [...originalArgv];

    if (!fs.existsSync(mockUserDataPath)) {
      fs.mkdirSync(mockUserDataPath, { recursive: true });
    }
  });

  afterEach(() => {
    DatabaseWrapper.cleanupTempDb();
    DatabaseWrapper.resetInstance();
    process.env.TEMP_DB = originalEnv;
    process.env.NODE_ENV = originalNodeEnv;
    process.argv = [...originalArgv];

    if (fs.existsSync(mockUserDataPath)) {
      fs.rmSync(mockUserDataPath, { recursive: true, force: true });
    }
  });

  it('should detect temp mode when TEMP_DB env var is set', () => {
    process.env.TEMP_DB = 'true';
    expect(DatabaseWrapper.isTempMode).toBe(true);
  });

  it('should detect temp mode when --temp-db flag is present in process.argv', () => {
    process.argv.push('--temp-db');
    expect(DatabaseWrapper.isTempMode).toBe(true);
  });

  it('should not be in temp mode by default', () => {
    expect(DatabaseWrapper.isTempMode).toBe(false);
  });

  it('should create and cleanup db_temp.json when running in temp mode', async () => {
    process.env.TEMP_DB = 'true';
    process.env.NODE_ENV = 'development';

    const tempDbPath = path.join(mockUserDataPath, 'db_temp.json');

    const db = await DatabaseWrapper.getInstance();
    expect(db).toBeDefined();
    expect(fs.existsSync(tempDbPath)).toBe(true);

    DatabaseWrapper.cleanupTempDb();
    expect(fs.existsSync(tempDbPath)).toBe(false);
  });

  it('should remove existing temp db on fresh start in temp mode', async () => {
    process.env.TEMP_DB = 'true';
    process.env.NODE_ENV = 'development';
    const tempDbPath = path.join(mockUserDataPath, 'db_temp.json');

    // Create leftover file
    fs.writeFileSync(tempDbPath, JSON.stringify({ stale: true }));
    expect(fs.existsSync(tempDbPath)).toBe(true);

    // Initializing in temp mode should wipe leftover file and initialize fresh schema
    const db = await DatabaseWrapper.getInstance();
    expect(db).toBeDefined();
    const data = fs.readFileSync(tempDbPath, 'utf-8');
    expect(data).not.toContain('stale');
  });
});
