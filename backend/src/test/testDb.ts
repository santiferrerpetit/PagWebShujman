import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

/**
 * Crea una base SQLite temporal aplicando las migraciones de Prisma y apunta DATABASE_URL a ella.
 * Debe llamarse ANTES de importar `lib/prisma` (usar import dinámico en los tests).
 */
export function setupTestDb(): { file: string; cleanup: () => void } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "club-test-"));
  const file = path.join(dir, "test.db");

  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const db = new Database(file);
  for (const name of fs.readdirSync(migrationsDir).sort()) {
    const sqlFile = path.join(migrationsDir, name, "migration.sql");
    if (fs.existsSync(sqlFile)) db.exec(fs.readFileSync(sqlFile, "utf8"));
  }
  db.close();

  process.env.DATABASE_URL = `file:${file}`;
  delete process.env.NODE_ENV;

  return { file, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}
