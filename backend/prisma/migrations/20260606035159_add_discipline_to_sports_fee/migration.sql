/*
  Warnings:

  - Added the required column `disciplineId` to the `SportsFee` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SportsFee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "disciplineId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SportsFee_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SportsFee" ("active", "amount", "category", "createdAt", "description", "id", "name") SELECT "active", "amount", "category", "createdAt", "description", "id", "name" FROM "SportsFee";
DROP TABLE "SportsFee";
ALTER TABLE "new_SportsFee" RENAME TO "SportsFee";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
