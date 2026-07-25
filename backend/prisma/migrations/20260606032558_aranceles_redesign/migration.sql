/*
  Warnings:

  - You are about to drop the column `accumulatedDebt` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `socialFeePaid` on the `Member` table. All the data in the column will be lost.
  - Added the required column `category` to the `SportsFee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SocialFee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "dueDay" INTEGER NOT NULL DEFAULT 10,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MemberSocialFee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "socialFeeId" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemberSocialFee_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MemberSocialFee_socialFeeId_fkey" FOREIGN KEY ("socialFeeId") REFERENCES "SocialFee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "contact" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Member" ("birthDate", "contact", "dni", "firstName", "id", "lastName") SELECT "birthDate", "contact", "dni", "firstName", "id", "lastName" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_dni_key" ON "Member"("dni");
CREATE TABLE "new_SportsFee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_SportsFee" ("active", "amount", "createdAt", "description", "id", "name") SELECT "active", "amount", "createdAt", "description", "id", "name" FROM "SportsFee";
DROP TABLE "SportsFee";
ALTER TABLE "new_SportsFee" RENAME TO "SportsFee";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SocialFee_category_key" ON "SocialFee"("category");

-- CreateIndex
CREATE UNIQUE INDEX "MemberSocialFee_memberId_periodMonth_periodYear_key" ON "MemberSocialFee"("memberId", "periodMonth", "periodYear");
