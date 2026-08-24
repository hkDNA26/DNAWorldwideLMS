-- CreateTable
CREATE TABLE "Collector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "inTraining" BOOLEAN NOT NULL DEFAULT false,
    "employment" TEXT,
    "livesOutcode" TEXT,
    "covers" TEXT,
    "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avgAppTime" TEXT,
    "notes" TEXT,
    "photoUrl" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Collector_area_idx" ON "Collector"("area");
