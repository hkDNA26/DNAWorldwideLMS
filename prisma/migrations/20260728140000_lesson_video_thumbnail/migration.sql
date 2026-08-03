-- Backfills a migration gap: this column was added directly to the dev
-- database outside the migration history at some point, so it was missing
-- from a from-scratch migration replay (e.g. a fresh deploy database).
ALTER TABLE "Lesson" ADD COLUMN "videoThumbnail" TEXT;
