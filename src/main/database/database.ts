import { JSONFilePreset } from 'lowdb/node';
import { Low } from 'lowdb';
import { DatabaseSchema, DatabaseTable, initDatabase } from './init-database';

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
