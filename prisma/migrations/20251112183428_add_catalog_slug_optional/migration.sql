/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Catalog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Catalog" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Catalog_slug_key" ON "Catalog"("slug");
