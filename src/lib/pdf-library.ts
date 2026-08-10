import { BookText, Newspaper, type LucideIcon } from "lucide-react";
import type { PdfCategory } from "@/generated/prisma/enums";

export interface PdfCategoryDef {
  category: PdfCategory;
  /** Tile / page heading shown to staff. */
  label: string;
  /** Short blurb under the heading. */
  description: string;
  /** Staff-facing route for this category. */
  href: string;
  icon: LucideIcon;
}

export const PDF_CATEGORIES: PdfCategoryDef[] = [
  {
    category: "INFORMATION_BOOKLET",
    label: "PDF Information Booklets",
    description: "Browse, view and download staff information booklets.",
    href: "/resources/booklets",
    icon: BookText,
  },
  {
    category: "NEWSLETTER",
    label: "Newsletters",
    description: "Read and download the latest staff newsletters.",
    href: "/resources/newsletters",
    icon: Newspaper,
  },
];

export function getPdfCategory(category: PdfCategory): PdfCategoryDef {
  const def = PDF_CATEGORIES.find((c) => c.category === category);
  if (!def) throw new Error(`Unknown PDF category: ${category}`);
  return def;
}
