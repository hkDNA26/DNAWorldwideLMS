-- Preview image for library files: first page of a PDF, first frame of a video.
-- Nullable so formats we can't render, and anything uploaded before this, simply
-- keep showing the file-type icon.
ALTER TABLE "PdfDocument" ADD COLUMN "thumbnailUrl" TEXT;
