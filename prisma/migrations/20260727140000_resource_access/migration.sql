-- Per-resource access control (Drug Search Console, Alcohol Unit Calculator)
CREATE TYPE "ResourceKey" AS ENUM ('DRUG_SEARCH', 'ALCOHOL_CALCULATOR');
CREATE TYPE "ResourceAccessStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

CREATE TABLE "ResourceAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resource" "ResourceKey" NOT NULL,
    "status" "ResourceAccessStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handledAt" TIMESTAMP(3),
    "handledBy" TEXT,

    CONSTRAINT "ResourceAccess_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ResourceAccess_userId_resource_key" ON "ResourceAccess"("userId", "resource");

ALTER TABLE "ResourceAccess" ADD CONSTRAINT "ResourceAccess_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Grandfather every existing user into approved Drug Search Console access
-- (they already use it today under the old, ungated model). Alcohol Unit
-- Calculator is brand new, so it stays request-only for everyone.
INSERT INTO "ResourceAccess" ("id", "userId", "resource", "status", "requestedAt", "handledAt")
SELECT gen_random_uuid()::text, "id", 'DRUG_SEARCH', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "User";
