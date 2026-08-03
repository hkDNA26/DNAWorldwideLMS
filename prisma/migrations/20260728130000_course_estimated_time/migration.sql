-- Free-text estimated time shown on the student course intro page
-- (e.g. "45 minutes"). Display-only, no calculations depend on it.
ALTER TABLE "Course" ADD COLUMN "estimatedTime" TEXT;
