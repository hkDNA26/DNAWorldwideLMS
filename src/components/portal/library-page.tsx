import { requireResourceAccess } from "@/lib/resource-access";
import { db } from "@/lib/db";
import { BackLink } from "@/components/portal/back-link";
import { PdfList } from "@/components/portal/pdf-list";
import { getLibraryCategory } from "@/lib/library";
import type { PdfCategory, ResourceKey } from "@/generated/prisma/enums";

/** Shared staff-facing listing for any file-library category. PdfCategory and
 * ResourceKey share the same names for these four values by design. */
export async function LibraryPage({ category }: { category: PdfCategory }) {
  await requireResourceAccess(category as unknown as ResourceKey);

  const def = getLibraryCategory(category);
  const documents = await db.pdfDocument.findMany({
    where: { category },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <BackLink href="/resources" label="Back to resources" />
      <div className="mb-8 animate-brand-fade-up">
        <h1 className="text-2xl font-bold text-ink">{def.label}</h1>
        <p className="text-ink-soft mt-1">{def.description}</p>
      </div>
      <PdfList documents={documents} emptyLabel={`Nothing here yet — check back soon.`} />
    </div>
  );
}
