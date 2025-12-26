/*
  Warnings:

  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '$2b$10$EpW.S7jY.gX0j.gX0j.gX0j.gX0j.gX0j.gX0j.gX0j.gX0j.gX0'; -- Dummy hash for migration
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP DEFAULT;
