import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { BackLink } from "@/components/portal/back-link";
import { PdfList } from "@/components/portal/pdf-list";
import { getLibraryCategory } from "@/lib/library";
import type { PdfCategory } from "@/generated/prisma/enums";

/** Shared staff-facing listing for any file-library category. */
export async function LibraryPage({ category }: { category: PdfCategory }) {
  const session = await getSession();
  if (!session) return null;

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
