/*
  Warnings:

  - You are about to drop the column `contact` on the `Member` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Member" ("birthDate", "dni", "firstName", "id", "isActive", "lastName") SELECT "birthDate", "dni", "firstName", "id", "isActive", "lastName" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_dni_key" ON "Member"("dni");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
