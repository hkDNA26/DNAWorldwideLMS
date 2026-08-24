-- CreateTable
CREATE TABLE "VideoResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'vimeo',
    "videoId" TEXT NOT NULL,
    "videoHash" TEXT,
    "thumbnailUrl" TEXT,
    "durationSec" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoResource_sortOrder_createdAt_idx" ON "VideoResource"("sortOrder", "createdAt");
