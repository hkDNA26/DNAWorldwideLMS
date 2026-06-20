import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DEFAULT_FIELDS } from "@/lib/certificate-defaults";
import { CertificateTemplateEditor } from "@/components/instructor/certificate-template-editor";

export default async function CertificateTemplatePage() {
  const session = await getSession();
  if (!session || session.role !== "INSTRUCTOR") redirect("/login");

  const tpl = await db.certificateTemplate.findUnique({
    where: { instructorId: session.userId },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Certificate Template</h1>
        <p className="text-slate-500 mt-1">
          Upload an A4 landscape background image and drag the field labels to position them on your certificate.
        </p>
      </div>
      <CertificateTemplateEditor
        initialImageUrl={tpl?.imageUrl ?? null}
        initialFields={(tpl?.fields as typeof DEFAULT_FIELDS) ?? DEFAULT_FIELDS}
      />
    </div>
  );
}
