-- Rename Role enum values (renames in place, preserves all existing row data)
ALTER TYPE "Role" RENAME VALUE 'INSTRUCTOR' TO 'ADMIN';
ALTER TYPE "Role" RENAME VALUE 'STUDENT' TO 'STAFF';
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STAFF';

-- New AccountRequest model (self-service "request access" flow)
CREATE TYPE "AccountRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

CREATE TABLE "AccountRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "AccountRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handledAt" TIMESTAMP(3),
    "handledBy" TEXT,

    CONSTRAINT "AccountRequest_pkey" PRIMARY KEY ("id")
);
