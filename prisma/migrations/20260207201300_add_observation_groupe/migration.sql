-- CreateTable
CREATE TABLE "ObservationGroupe" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "niveau" TEXT NOT NULL,
    "sexeGroupe" TEXT NOT NULL,
    "observation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "aedId" TEXT NOT NULL,

    CONSTRAINT "ObservationGroupe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ObservationGroupe_date_idx" ON "ObservationGroupe"("date");

-- CreateIndex
CREATE INDEX "ObservationGroupe_niveau_idx" ON "ObservationGroupe"("niveau");

-- CreateIndex
CREATE UNIQUE INDEX "ObservationGroupe_date_niveau_sexeGroupe_key" ON "ObservationGroupe"("date", "niveau", "sexeGroupe");

-- AddForeignKey
ALTER TABLE "ObservationGroupe" ADD CONSTRAINT "ObservationGroupe_aedId_fkey" FOREIGN KEY ("aedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
