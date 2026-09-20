import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getResourceAccessMap } from "@/lib/resource-access";
import type { ResourceKey } from "@/generated/prisma/enums";

/**
 * Authorisation for files served out of /uploads.
 *
 * Uploaded files used to be served to anyone who had (or guessed) the URL. UUID
 * filenames made that hard for most folders, but SCORM packages live at the
 * entirely predictable scorm/<courseId>, and URLs leak via history and sharing
 * regardless — so gated course content and staff documents were effectively public.
 */

// Needed before a session exists: tender logos render on the login screen, and
// certificate backgrounds render on the public certificate verification page.
const PUBLIC_FOLDERS = new Set(["organizations", "certificate-templates"]);

// Folders whose whole contents belong to one gated resource.
const FOLDER_RESOURCE: Record<string, ResourceKey> = {
  collectors: "COLLECTORS",
  clinics: "CLINICS",
  "street-drugs": "STREET_DRUG_SEARCH",
};

// Folders holding library documents, where the specific category is per-file.
const LIBRARY_FOLDERS = new Set(["pdfs", "cpd", "powerpoint"]);

export async function canAccessUpload(segments: string[]): Promise<boolean> {
  const folder = segments[0];
  if (!folder) return false;

  if (PUBLIC_FOLDERS.has(folder)) return true;

  const session = await getSession();
  if (!session) return false;
  if (session.role === "ADMIN") return true;

  if (folder === "scorm") {
    // scorm/<courseId>/... — only for people actually enrolled on that course.
    const courseId = segments[1];
    if (!courseId) return false;
    const enrollment = await db.enrollment.findUnique({
      where: { studentId_courseId: { studentId: session.userId, courseId } },
      select: { id: true },
    });
    return Boolean(enrollment);
  }

  if (LIBRARY_FOLDERS.has(folder)) {
    // PdfCategory and ResourceKey share names for these, so the document's own
    // category is the permission to check.
    const doc = await db.pdfDocument.findFirst({
      where: { fileUrl: `/uploads/${segments.join("/")}` },
      select: { category: true },
    });
    if (!doc) return false;
    const access = await getResourceAccessMap(session.userId, session.role);
    return access[doc.category as unknown as ResourceKey] === "GRANTED";
  }

  const resource = FOLDER_RESOURCE[folder];
  if (resource) {
    const access = await getResourceAccessMap(session.userId, session.role);
    return access[resource] === "GRANTED";
  }

  if (folder === "videos") {
    // Lesson videos are course content, so require enrollment where the file can
    // be traced back to a course. Uploads not attached to a lesson (yet) fall
    // through to the signed-in check below.
    const lesson = await db.lesson.findFirst({
      where: { videoUrl: `/uploads/${segments.join("/")}` },
      select: { module: { select: { courseId: true } } },
    });
    if (lesson) {
      const enrollment = await db.enrollment.findUnique({
        where: {
          studentId_courseId: { studentId: session.userId, courseId: lesson.module.courseId },
        },
        select: { id: true },
      });
      return Boolean(enrollment);
    }
  }

  // Covers, thumbnails and inline lesson images: signed-in users only.
  return true;
}
