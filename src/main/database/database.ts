import { JSONFilePreset } from 'lowdb/node';
import { Low } from 'lowdb';
import { DatabaseSchema, initDatabase } from './init-database';

export class DatabaseWrapper {
  private static readonly DB_FILE: string = './build/src/db.json';
  private static _instance: DatabaseWrapper | undefined = undefined;

  private constructor(private database: Low<DatabaseSchema>) {}

  static async getInstance(): Promise<DatabaseWrapper> {
    if (!DatabaseWrapper._instance) {
      const db = await JSONFilePreset(DatabaseWrapper.DB_FILE, initDatabase());
      DatabaseWrapper._instance = new DatabaseWrapper(db);
    }
    return DatabaseWrapper._instance!;
  }

  readTable<T>(tableName: keyof DatabaseSchema): T | null {
    if (!(tableName in this.database.data)) {
      return null;
    }
    const data = this.database.data[tableName];
    return data as T;
  }

  async updateTable<T>(
    tableName: keyof DatabaseSchema,
    table: T,
  ): Promise<void> {
    (this.database.data[tableName] as T) = table;
    await this.database.write();
  }
}
