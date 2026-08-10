import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DocumentsManager, type AdminPdfDoc } from "@/components/instructor/documents-manager";

export default async function InstructorDocumentsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const rows = await db.pdfDocument.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      category: true,
      title: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      createdAt: true,
    },
  });

  const documents: AdminPdfDoc[] = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">PDF Library</h1>
        <p className="text-ink-soft mt-1">
          Add or remove the information booklets and newsletters that staff can view and download in Resources.
        </p>
      </div>
      <DocumentsManager documents={documents} />
    </div>
  );
}
