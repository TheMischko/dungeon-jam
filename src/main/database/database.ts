import { JSONFilePreset } from 'lowdb/node';
import { Low } from 'lowdb';
import { DatabaseSchema, DatabaseTable, initDatabase } from './init-database';
import { app } from 'electron';
import path from 'path';
import * as fs from 'node:fs';

export class DatabaseWrapper {
  private static activeTempFilePath: string | null = null;

  public static get isTempMode(): boolean {
    const isArgTempMode =
      Array.isArray(process.argv) && process.argv.includes('--temp-db');
    return process.env.TEMP_DB === 'true' || isArgTempMode;
  }

  private static get DB_FILE(): string {
    let fullPath: string;

    if (DatabaseWrapper.isTempMode) {
      fullPath = path.join(app.getPath('userData'), 'db_temp.json');
      DatabaseWrapper.activeTempFilePath = fullPath;
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch {
          // ignore error if deletion fails
        }
      }
    } else {
      fullPath =
        process.env.ENV !== 'test'
          ? path.join(app.getPath('userData'), 'db.json')
          : path.join(__dirname, 'db_test.json');
    }

    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return fullPath;
  }
  private static _instance: DatabaseWrapper | undefined = undefined;

  private constructor(private database: Low<DatabaseSchema>) {}

  static async getInstance(): Promise<DatabaseWrapper> {
    if (!DatabaseWrapper._instance) {
      const db = await JSONFilePreset(DatabaseWrapper.DB_FILE, initDatabase());
      await db.write();
      DatabaseWrapper._instance = new DatabaseWrapper(db);
    }
    return DatabaseWrapper._instance!;
  }

  static resetInstance(): void {
    DatabaseWrapper._instance = undefined;
    DatabaseWrapper.activeTempFilePath = null;
  }

  static cleanupTempDb(): void {
    if (
      DatabaseWrapper.activeTempFilePath &&
      fs.existsSync(DatabaseWrapper.activeTempFilePath)
    ) {
      try {
        fs.unlinkSync(DatabaseWrapper.activeTempFilePath);
      } catch {
        // ignore errors during cleanup
      }
    }
  }

  readTable<T>(tableName: DatabaseTable): T | null {
    if (!(tableName in this.database.data)) {
      return null;
    }
    const data = this.database.data[tableName];
    return data as T;
  }

  async updateTable<T>(tableName: DatabaseTable, table: T): Promise<void> {
    (this.database.data[tableName] as T) = table;
    await this.database.write();
  }
}
