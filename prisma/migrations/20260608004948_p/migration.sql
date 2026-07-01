/*
  Warnings:

  - You are about to drop the `Profil` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Profil" DROP CONSTRAINT "Profil_userId_fkey";

-- DropTable
DROP TABLE "Profil";

-- CreateTable
CREATE TABLE "profils" (
    "id" SERIAL NOT NULL,
    "bio" TEXT DEFAULT 'Binge-watcher by night, dreamer by day.',
    "avatar" TEXT,
    "cover" TEXT,
    "userId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profils_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profils_userId_key" ON "profils"("userId");

-- AddForeignKey
ALTER TABLE "profils" ADD CONSTRAINT "profils_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
