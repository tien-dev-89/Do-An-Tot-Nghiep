/*
  Warnings:

  - You are about to drop the column `must_change_password` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "must_change_password";
