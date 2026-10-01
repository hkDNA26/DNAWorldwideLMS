-- Only the first visit was recorded, which can't distinguish a resource somebody
-- relies on from one they opened once months ago. Existing rows start at 0 opens;
-- firstAccessedAt is left as the historical record of when they first looked.
ALTER TABLE "ResourceAccess" ADD COLUMN "lastAccessedAt" TIMESTAMP(3);
ALTER TABLE "ResourceAccess" ADD COLUMN "accessCount" INTEGER NOT NULL DEFAULT 0;
