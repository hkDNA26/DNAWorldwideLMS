-- CreateEnum
CREATE TYPE "PdfCategory" AS ENUM ('INFORMATION_BOOKLET', 'NEWSLETTER');

-- CreateTable
CREATE TABLE "PdfDocument" (
    "id" TEXT NOT NULL,
    "category" "PdfCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PdfDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PdfDocument_category_createdAt_idx" ON "PdfDocument"("category", "createdAt");
