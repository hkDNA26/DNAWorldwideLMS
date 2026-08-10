import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { BackLink } from "@/components/portal/back-link";
import { PdfList } from "@/components/portal/pdf-list";
import { getPdfCategory } from "@/lib/pdf-library";

export default async function NewslettersPage() {
  const session = await getSession();
  if (!session) return null;

  const def = getPdfCategory("NEWSLETTER");
  const documents = await db.pdfDocument.findMany({
    where: { category: "NEWSLETTER" },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, fileUrl: true, fileName: true, fileSize: true, createdAt: true },
  });

  return (
    <div>
      <BackLink href="/resources" label="Back to resources" />
      <div className="mb-8 animate-brand-fade-up">
        <h1 className="text-2xl font-bold text-ink">{def.label}</h1>
        <p className="text-ink-soft mt-1">{def.description}</p>
      </div>
      <PdfList documents={documents} emptyLabel="No newsletters have been added yet." />
    </div>
  );
}
