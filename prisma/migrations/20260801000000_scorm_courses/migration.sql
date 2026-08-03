-- SCORM courses: an instructor can upload a single SCORM .zip package for a
-- whole course instead of building it out of modules/lessons. All additive —
-- existing courses default to CourseType.STANDARD and are unaffected.

CREATE TYPE "CourseType" AS ENUM ('STANDARD', 'SCORM');
CREATE TYPE "ScormVersion" AS ENUM ('SCORM_12', 'SCORM_2004');
CREATE TYPE "ScormStatus" AS ENUM ('NOT_ATTEMPTED', 'INCOMPLETE', 'COMPLETED', 'PASSED', 'FAILED', 'BROWSED');

ALTER TABLE "Course" ADD COLUMN "type" "CourseType" NOT NULL DEFAULT 'STANDARD';

CREATE TABLE "ScormPackage" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "version" "ScormVersion" NOT NULL,
    "entryPoint" TEXT NOT NULL,
    "extractedPath" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "manifestTitle" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScormPackage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ScormPackage_courseId_key" ON "ScormPackage"("courseId");

ALTER TABLE "ScormPackage" ADD CONSTRAINT "ScormPackage_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCORM tracking lives directly on Enrollment: there's exactly one SCORM
-- "session" per enrollment (course-level package, no per-lesson granularity).
ALTER TABLE "Enrollment" ADD COLUMN "scormStatus" "ScormStatus";
ALTER TABLE "Enrollment" ADD COLUMN "scormScoreRaw" DOUBLE PRECISION;
ALTER TABLE "Enrollment" ADD COLUMN "scormScoreMin" DOUBLE PRECISION;
ALTER TABLE "Enrollment" ADD COLUMN "scormScoreMax" DOUBLE PRECISION;
ALTER TABLE "Enrollment" ADD COLUMN "scormSuspendData" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "scormLocation" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "scormSessionUpdatedAt" TIMESTAMP(3);
