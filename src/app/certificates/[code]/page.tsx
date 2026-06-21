import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { CertificatePrintButton } from "@/components/certificate-print-button";
import type { TemplateField } from "@/lib/certificate-defaults";
import { DEFAULT_FIELDS, formatCertificateId } from "@/lib/certificate-defaults";

type Params = { code: string };

export default async function CertificatePage({ params }: { params: Promise<Params> }) {
  const { code } = await params;

  const cert = await db.certificate.findUnique({
    where: { verificationCode: code },
    include: {
      student: { select: { name: true } },
      course: {
        select: {
          title: true,
          instructor: {
            select: {
              name: true,
              certificateTemplate: { select: { imageUrl: true, fields: true } },
            },
          },
        },
      },
    },
  });

  if (!cert) notFound();

  const tplData = cert.course.instructor.certificateTemplate;
  const fields: TemplateField[] = tplData
    ? (tplData.fields as TemplateField[])
    : DEFAULT_FIELDS;
  const imageUrl = tplData?.imageUrl ?? null;

  const certId = formatCertificateId(cert.verificationCode, cert.issuedAt);

  const fieldValues: Record<string, string> = {
    studentName: cert.student.name,
    courseTitle: cert.course.title,
    instructorName: cert.course.instructor.name,
    issuedDate: formatDate(cert.issuedAt),
    certificateId: certId,
  };

  const hasCustomTemplate = !!imageUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-amber-50 to-slate-100 flex flex-col items-center justify-center p-6 print:bg-white print:p-0 print:min-h-0">

      {/* Certificate */}
      {hasCustomTemplate ? (
        /* ── Custom template ──────────────────────────────────────────── */
        <div
          className="relative overflow-hidden print:shadow-none"
          style={{
            // A4 landscape at screen resolution: 1122 × 794 — cap at viewport
            width: "min(1122px, 100%)",
            aspectRatio: "297 / 210",
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          }}
          id="certificate"
        >
          {fields.map((field) => (
            <div
              key={field.key}
              style={{
                position: "absolute",
                left: `${field.x}%`,
                top: `${field.y}%`,
                transform:
                  field.align === "center"
                    ? "translate(-50%, -50%)"
                    : field.align === "right"
                    ? "translate(-100%, -50%)"
                    : "translate(0, -50%)",
                fontSize: `${field.fontSize}px`,
                color: field.color,
                fontWeight: field.bold ? "700" : "400",
                textAlign: field.align,
                whiteSpace: "nowrap",
                lineHeight: 1.2,
              }}
            >
              {fieldValues[field.key] ?? ""}
            </div>
          ))}
        </div>
      ) : (
        /* ── Default built-in template ────────────────────────────────── */
        <div
          className="w-full max-w-3xl bg-white relative print:shadow-none"
          style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.18)", border: "2px solid #c6a84b", borderRadius: "4px" }}
          id="certificate"
        >
          {/* Decorative borders */}
          <div className="absolute inset-3 pointer-events-none" style={{ border: "1px solid #c6a84b", borderRadius: "2px" }} />
          <div className="absolute inset-4 pointer-events-none" style={{ border: "0.5px solid rgba(198,168,75,0.4)", borderRadius: "2px" }} />

          {/* Corner ornaments */}
          {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
            <svg key={pos} className={`absolute ${pos} w-8 h-8`} viewBox="0 0 40 40" fill="none">
              <path d="M2 20 L2 2 L20 2" stroke="#c6a84b" strokeWidth="1.5" fill="none" />
              <circle cx="2" cy="2" r="2" fill="#c6a84b" />
            </svg>
          ))}

          <div className="px-16 pt-14 pb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400" />
              <img src="/logo.png" alt="DNA Worldwide" className="h-10 w-auto flex-shrink-0" />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 mb-1">DNA Worldwide</p>

            <h1 className="text-4xl font-bold mb-3 mt-4" style={{ color: "#1a2c5b", fontFamily: "Georgia, serif" }}>
              Certificate of Completion
            </h1>

            <div className="flex items-center justify-center gap-3 mt-1 mb-8">
              <div className="h-px w-20 bg-amber-400" />
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <div className="h-px w-20 bg-amber-400" />
            </div>

            <p className="text-sm text-slate-500 tracking-wide mb-3">This is to certify that</p>

            <p className="text-5xl mb-6 leading-tight" style={{
              color: "#1a3a8f", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700,
              borderBottom: "2px solid #c6a84b", display: "inline-block",
              paddingBottom: "6px", paddingLeft: "24px", paddingRight: "24px",
            }}>
              {cert.student.name}
            </p>

            <p className="text-sm text-slate-500 mt-6 mb-2 tracking-wide">has successfully completed the course</p>

            <h2 className="text-2xl font-bold mb-8" style={{ color: "#1a2c5b", fontFamily: "Georgia, serif" }}>
              {cert.course.title}
            </h2>

            <div className="flex items-end justify-between mt-6 mb-2 gap-8">
              <div className="text-center flex-1">
                <div className="border-t border-slate-300 pt-2 mt-8">
                  <p className="text-sm font-semibold text-slate-700">{formatDate(cert.issuedAt)}</p>
                  <p className="text-xs text-slate-400 mt-0.5 tracking-wide uppercase">Date Issued</p>
                </div>
              </div>
              <div className="flex flex-col items-center flex-shrink-0">
                <svg viewBox="0 0 96 96" className="w-20 h-20" fill="none">
                  <circle cx="48" cy="48" r="46" stroke="#c6a84b" strokeWidth="2" fill="none" />
                  <circle cx="48" cy="48" r="40" stroke="#c6a84b" strokeWidth="0.5" fill="none" strokeDasharray="3 2" />
                  <circle cx="48" cy="48" r="34" fill="#fffbeb" stroke="#c6a84b" strokeWidth="1" />
                  <path d="M48 20l5.56 11.27L66 32.73l-9 8.77 2.12 12.38L48 47.77l-11.12 6.11L39 41.5 30 32.73l12.44-1.46L48 20z" fill="#c6a84b" />
                  <text x="48" y="70" textAnchor="middle" fontSize="7" fill="#92742a" fontFamily="Georgia,serif" letterSpacing="1">CERTIFIED</text>
                </svg>
              </div>
              <div className="text-center flex-1">
                <div className="border-t border-slate-300 pt-2 mt-8">
                  <p className="text-sm font-semibold text-slate-700">{cert.course.instructor.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 tracking-wide uppercase">Instructor</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-16 py-3" style={{ borderTop: "1px solid #e5d99a", backgroundColor: "#fdfbf0" }}>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-slate-500">Verified Certificate</span>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Certificate ID</p>
              <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5 tracking-wide">{certId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Issued</p>
              <p className="text-xs text-slate-600 mt-0.5">{formatDate(cert.issuedAt)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3 print:hidden">
        <CertificatePrintButton />
        <p className="text-xs text-slate-400">
          Share this URL to verify authenticity — valid permanently.
        </p>
      </div>
    </div>
  );
}
