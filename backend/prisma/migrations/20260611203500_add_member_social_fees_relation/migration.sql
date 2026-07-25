-- Sincronizar relación memberSocialFees en el modelo Member
-- La tabla MemberSocialFee ya existe con la foreign key memberId
-- Esta migración asegura que Prisma schema esté sincronizado

-- Recrear la tabla Member para incluir la relación bidireccional
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

INSERT INTO "new_Member" ("birthDate", "dni", "firstName", "id", "isActive", "lastName", "email", "phone")
SELECT "birthDate", "dni", "firstName", "id", "isActive", "lastName", "email", "phone" FROM "Member";

DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_dni_key" ON "Member"("dni");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
