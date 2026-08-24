import { BookText, Newspaper, Presentation, GraduationCap, type LucideIcon } from "lucide-react";
import type { PdfCategory } from "@/generated/prisma/enums";

export interface LibraryCategoryDef {
  category: PdfCategory;
  /** Tile / page heading shown to staff. */
  label: string;
  /** Short blurb under the heading. */
  description: string;
  /** Staff-facing route. */
  href: string;
  icon: LucideIcon;
  /** Upload folder under public/uploads. */
  folder: string;
  /** Allowed MIME types for uploads. */
  accept: string[];
  /** Allowed file extensions (fallback when the browser sends a generic MIME). */
  acceptExt: string[];
  /** `accept` attribute value for the file <input>. */
  inputAccept: string;
  /** Human hint shown next to the upload control. */
  acceptHint: string;
}

const PDF = { mimes: ["application/pdf"], ext: [".pdf"] };
const OFFICE_PPT = {
  mimes: [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.template",
    "application/vnd.ms-powerpoint",
  ],
  ext: [".pptx", ".ppt", ".potx"],
};
const CPD_MIXED = {
  mimes: [
    // documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    // images
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    // videos
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
  ext: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".mov"],
};

export const LIBRARY_CATEGORIES: LibraryCategoryDef[] = [
  {
    category: "INFORMATION_BOOKLET",
    label: "PDF Information Booklets",
    description: "Browse, view and download staff information booklets.",
    href: "/resources/booklets",
    icon: BookText,
    folder: "pdfs",
    accept: PDF.mimes,
    acceptExt: PDF.ext,
    inputAccept: "application/pdf",
    acceptHint: "PDF files",
  },
  {
    category: "NEWSLETTER",
    label: "Newsletters",
    description: "Read and download the latest staff newsletters.",
    href: "/resources/newsletters",
    icon: Newspaper,
    folder: "pdfs",
    accept: PDF.mimes,
    acceptExt: PDF.ext,
    inputAccept: "application/pdf",
    acceptHint: "PDF files",
  },
  {
    category: "POWERPOINT_TEMPLATE",
    label: "PowerPoint Templates",
    description: "Download branded PowerPoint templates to build your own decks.",
    href: "/resources/powerpoint",
    icon: Presentation,
    folder: "powerpoint",
    accept: OFFICE_PPT.mimes,
    acceptExt: OFFICE_PPT.ext,
    inputAccept: ".pptx,.ppt,.potx,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint",
    acceptHint: "PowerPoint (.pptx, .ppt, .potx)",
  },
  {
    category: "CPD_MATERIAL",
    label: "CPD Content & Material",
    description: "Documents, images and videos for your continuing professional development.",
    href: "/resources/cpd",
    icon: GraduationCap,
    folder: "cpd",
    accept: CPD_MIXED.mimes,
    acceptExt: CPD_MIXED.ext,
    inputAccept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,image/*,video/mp4,video/webm,.mov",
    acceptHint: "Documents, images or videos",
  },
];

export function getLibraryCategory(category: PdfCategory): LibraryCategoryDef {
  const def = LIBRARY_CATEGORIES.find((c) => c.category === category);
  if (!def) throw new Error(`Unknown library category: ${category}`);
  return def;
}

/** True when the file's MIME type or extension is allowed for the category. */
export function isAllowedForCategory(def: LibraryCategoryDef, mime: string, fileName: string): boolean {
  if (def.accept.includes(mime)) return true;
  const lower = fileName.toLowerCase();
  return def.acceptExt.some((ext) => lower.endsWith(ext));
}
