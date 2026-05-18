-- CreateTable
CREATE TABLE "Prueba" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "observacion" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Prueba_email_key" ON "Prueba"("email");
