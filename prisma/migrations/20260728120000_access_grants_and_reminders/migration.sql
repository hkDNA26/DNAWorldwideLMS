-- Drop the self-service "request an account" flow — accounts are now only
-- ever created by an admin from the Staff section, no approval queue needed.
DROP TABLE "AccountRequest";
DROP TYPE "AccountRequestStatus";

-- ResourceAccess moves from a request/approve model to a direct grant,
-- matching Enrollment: admin grants access, we track whether the assignment
-- email was sent and whether the student ever opened the resource, so a
-- reminder sweep can nudge them.
ALTER TABLE "ResourceAccess" ADD COLUMN "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ResourceAccess" ADD COLUMN "notifiedAt" TIMESTAMP(3);
ALTER TABLE "ResourceAccess" ADD COLUMN "firstAccessedAt" TIMESTAMP(3);
ALTER TABLE "ResourceAccess" ADD COLUMN "lastReminderAt" TIMESTAMP(3);

-- Preserve history for existing rows: use the old requestedAt as grantedAt.
-- notifiedAt/firstAccessedAt/lastReminderAt stay NULL on purpose — these
-- grants predate the new notify/reminder system, so the reminder sweep
-- (which only acts on rows where notifiedAt IS NOT NULL) leaves them alone.
UPDATE "ResourceAccess" SET "grantedAt" = "requestedAt";

-- Drop rows that were never approved under the old model — there's no
-- "pending" concept anymore, and declined rows aren't grants.
DELETE FROM "ResourceAccess" WHERE "status" != 'APPROVED';

ALTER TABLE "ResourceAccess" DROP COLUMN "status";
ALTER TABLE "ResourceAccess" DROP COLUMN "requestedAt";
ALTER TABLE "ResourceAccess" DROP COLUMN "handledAt";
ALTER TABLE "ResourceAccess" DROP COLUMN "handledBy";
DROP TYPE "ResourceAccessStatus";

-- Same notify/reminder tracking on Enrollment, for course assignments made
-- after initial staff creation (which are covered by the welcome email
-- instead and don't need a separate notifiedAt stamp).
ALTER TABLE "Enrollment" ADD COLUMN "notifiedAt" TIMESTAMP(3);
ALTER TABLE "Enrollment" ADD COLUMN "firstAccessedAt" TIMESTAMP(3);
ALTER TABLE "Enrollment" ADD COLUMN "lastReminderAt" TIMESTAMP(3);
