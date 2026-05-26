import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root',
})

/**
 * Servicio para manejar la base de datos SQLite utilizando el plugin de Capacitor.
 * @author Johan Alexander Farfan Sierra <johanfarfan25@gmail.com>
 */
export class SqliteService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private readonly dbName = 'finance_db';

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  //** Inicializa el plugin de SQLite */
  async initializePlugin(): Promise<void> {
    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
      await customElements.whenDefined('jeep-sqlite');
      const jeepSqliteEl = document.querySelector('jeep-sqlite');
      if (jeepSqliteEl != null) {
        await this.sqlite.initWebStore();
      }
    }
  }

   //** Crea la base de datos */
  async createDatabase(): Promise<void> {
    this.db = await this.sqlite.createConnection(
      this.dbName,
      false,
      'no-encryption',
      1,
      false,
    );

    await this.db.open();

    await this.createTables();
  }

  //** Crea las tablas de la base de datos */
  private async createTables(): Promise<void> {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        pin TEXT NOT NULL,
        currency TEXT NOT NULL,
        created_at TEXT NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT,
        created_at TEXT NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS incomes (
        id TEXT PRIMARY KEY,
        category_id TEXT,
        amount REAL,
        description TEXT,
        date TEXT,
        created_at TEXT
      );`,

      `CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        category_id TEXT,
        amount REAL,
        description TEXT,
        date TEXT,
        created_at TEXT
      );`,

      `CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        category_id TEXT,
        limit_amount REAL,
        month INTEGER,
        year INTEGER,
        created_at TEXT
      );`,
    ];

    for (const query of queries) {
      await this.db.execute(query);
    }
  }

  getConnection(): SQLiteDBConnection {
    return this.db;
  }

  async close(): Promise<void> {
    await this.sqlite.closeConnection(this.dbName, false);
  }
}
