// src/local/db.ts
import * as SQLite from 'expo-sqlite';

export type Row = Record<string, any>;

let db: SQLite.SQLiteDatabase | null = null;

export async function openDB() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('splitwise.db');
  return db;
}

export async function initDB() {
  const d = await openDB();
  // Basic schema for fully-offline app
  await d.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS me (
      k TEXT PRIMARY KEY,
      v TEXT
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      currency TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS group_members (
      id TEXT PRIMARY KEY,
      groupId TEXT NOT NULL,
      userId TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      groupId TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      paidById TEXT NOT NULL,
      splitType TEXT NOT NULL, -- equal|exact|percentage|shares
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expense_shares (
      id TEXT PRIMARY KEY,
      expenseId TEXT NOT NULL,
      userId TEXT NOT NULL,
      value REAL NOT NULL -- meaning depends on splitType
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      groupId TEXT NOT NULL,
      fromId TEXT NOT NULL,
      toId TEXT NOT NULL,
      amount REAL NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
}

// tiny helpers
export async function run(sql: string, params: any[] = []) {
  const d = await openDB();
  await d.runAsync(sql, params);
}

export async function all<T extends Row = Row>(sql: string, params: any[] = []): Promise<T[]> {
  const d = await openDB();
  const r = await d.getAllAsync<T>(sql, params);
  return r ?? [];
}

export async function get<T extends Row = Row>(sql: string, params: any[] = []): Promise<T | null> {
  const d = await openDB();
  const r = await d.getFirstAsync<T>(sql, params);
  return (r ?? null) as T | null;
}

// ids
export const cuid = () => 'c' + Math.random().toString(36).slice(2) + Date.now().toString(36);
