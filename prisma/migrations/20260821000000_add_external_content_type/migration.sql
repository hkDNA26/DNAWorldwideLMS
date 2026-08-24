-- Adds EXTERNAL to ContentType: a lesson whose content is an embedded
-- external interactive app (iframe), completed via a postMessage bridge
-- rather than forge-lms's own TEXT/VIDEO/QUIZ rendering.
ALTER TYPE "ContentType" ADD VALUE 'EXTERNAL';
