/*
  Warnings:

  - Made the column `slug` on table `Catalog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Catalog" ALTER COLUMN "slug" SET NOT NULL;
