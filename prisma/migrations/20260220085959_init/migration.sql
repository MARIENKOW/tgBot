/*
  Warnings:

  - You are about to alter the column `userId` on the `access` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `accessUntil` on the `access` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "access" ALTER COLUMN "userId" SET DATA TYPE INTEGER,
ALTER COLUMN "accessUntil" SET DATA TYPE INTEGER;
