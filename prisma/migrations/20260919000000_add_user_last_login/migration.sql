-- Track the most recent successful login so course reporting can show who has
-- never signed in. Nullable: existing users have no known previous login.
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
