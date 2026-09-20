-- Lets a password change or account revocation invalidate existing sessions
-- immediately, rather than leaving the old JWT usable until it expires.
ALTER TABLE "User" ADD COLUMN "sessionsValidFrom" TIMESTAMP(3);
