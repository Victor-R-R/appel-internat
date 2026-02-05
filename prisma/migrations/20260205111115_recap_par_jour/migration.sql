/*
  Warnings:

  - You are about to drop the column `niveau` on the `Recap` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "contenu" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Recap" ("contenu", "createdAt", "date", "id") SELECT "contenu", "createdAt", "date", "id" FROM "Recap";
DROP TABLE "Recap";
ALTER TABLE "new_Recap" RENAME TO "Recap";
CREATE UNIQUE INDEX "Recap_date_key" ON "Recap"("date");
CREATE INDEX "Recap_date_idx" ON "Recap"("date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
