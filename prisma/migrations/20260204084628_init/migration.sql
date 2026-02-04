-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "niveau" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Eleve" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "niveau" TEXT NOT NULL,
    "sexe" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Appel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "niveau" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "observation" TEXT,
    "eleveId" TEXT NOT NULL,
    "aedId" TEXT NOT NULL,
    CONSTRAINT "Appel_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appel_aedId_fkey" FOREIGN KEY ("aedId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "niveau" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Appel_date_idx" ON "Appel"("date");

-- CreateIndex
CREATE INDEX "Appel_niveau_idx" ON "Appel"("niveau");

-- CreateIndex
CREATE UNIQUE INDEX "Appel_eleveId_date_key" ON "Appel"("eleveId", "date");

-- CreateIndex
CREATE INDEX "Recap_date_idx" ON "Recap"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Recap_date_niveau_key" ON "Recap"("date", "niveau");
