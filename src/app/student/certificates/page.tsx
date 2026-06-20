import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Award, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function CertificatesPage() {
  const session = await getSession();
  if (!session) return null;

  const certificates = await db.certificate.findMany({
    where: { studentId: session.userId },
    include: {
      course: {
        select: { title: true, instructor: { select: { name: true } } },
      },
    },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Certificates</h1>
        <p className="text-slate-500 mt-1">Certificates you&apos;ve earned by completing courses</p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No certificates yet</h3>
          <p className="text-slate-500">Complete a course to earn your first certificate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Award className="h-7 w-7 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 line-clamp-2">{cert.course.title}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">by {cert.course.instructor.name}</p>
                  <p className="text-xs text-slate-400 mt-1">Completed {formatDate(cert.issuedAt)}</p>
                </div>
              </div>
              <Link
                href={`/certificates/${cert.verificationCode}`}
                target="_blank"
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-auto"
              >
                View Certificate
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
