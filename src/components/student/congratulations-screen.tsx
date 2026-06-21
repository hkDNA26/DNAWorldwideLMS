"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Award, Download, Home, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DEFAULT_FIELDS, formatCertificateId, type TemplateField } from "@/lib/certificate-defaults";
import { Button } from "@/components/ui/button";

interface CertData {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
  verificationCode: string;
  templateImageUrl: string | null;
  templateFields: TemplateField[] | null;
}

export function CongratulationsScreen({ cert }: { cert: CertData }) {
  const [visible, setVisible] = useState(false);
  const [certVisible, setCertVisible] = useState(false);

  const certId = formatCertificateId(cert.verificationCode, cert.issuedAt);
  const fields = cert.templateFields ?? DEFAULT_FIELDS;
  const fieldValues: Record<string, string> = {
    studentName: cert.studentName,
    courseTitle: cert.courseTitle,
    instructorName: cert.instructorName,
    issuedDate: formatDate(cert.issuedAt),
    certificateId: certId,
  };

  useEffect(() => {
    // Stagger: hero in first, then confetti, then certificate
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => {
      // Left cannon
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ["#1a3d8f", "#2d5fc4", "#f59e0b", "#10b981", "#ffffff"],
        scalar: 1.1,
      });
      // Right cannon
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ["#1a3d8f", "#2d5fc4", "#f59e0b", "#10b981", "#ffffff"],
        scalar: 1.1,
      });
      // Centre burst
      confetti({
        particleCount: 60,
        spread: 90,
        origin: { x: 0.5, y: 0.5 },
        colors: ["#f59e0b", "#c6a84b", "#fcd34d"],
        scalar: 0.8,
        startVelocity: 30,
      });
    }, 600);
    const t3 = setTimeout(() => {
      // Second wave
      confetti({ particleCount: 40, angle: 60, spread: 45, origin: { x: 0, y: 0.6 }, colors: ["#1a3d8f", "#f59e0b", "#fff"] });
      confetti({ particleCount: 40, angle: 120, spread: 45, origin: { x: 1, y: 0.6 }, colors: ["#1a3d8f", "#f59e0b", "#fff"] });
    }, 1800);
    const t4 = setTimeout(() => setCertVisible(true), 1200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1f4e] via-[#1a3d8f] to-[#0d1f4e] flex flex-col items-center py-12 px-4">

      {/* Hero */}
      <div
        className="text-center mb-12"
        style={{
          transform: visible ? "translateY(0) scale(1)" : "translateY(-30px) scale(0.9)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.7s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease",
        }}
      >
        {/* Trophy icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-28 h-28 rounded-full bg-amber-400/20 flex items-center justify-center animate-pulse">
            <div className="w-20 h-20 rounded-full bg-amber-400/30 flex items-center justify-center">
              <Award className="w-12 h-12 text-amber-400" />
            </div>
          </div>
          {/* Orbiting stars */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <Star
              key={i}
              className="absolute w-4 h-4 text-amber-300 fill-amber-300"
              style={{
                transform: `rotate(${deg}deg) translateY(-52px)`,
                animation: `spin 6s linear infinite`,
                animationDelay: `${i * 0.2}s`,
                opacity: visible ? 1 : 0,
                transition: `opacity 0.3s ease ${0.3 + i * 0.05}s`,
              }}
            />
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Congratulations! 🎉
        </h1>
        <p className="text-xl text-blue-200 mb-1">{cert.studentName}</p>
        <p className="text-blue-300 text-sm max-w-md mx-auto">
          You've successfully completed <span className="text-white font-semibold">{cert.courseTitle}</span>. Your certificate has been issued!
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button
            onClick={() => window.print()}
            className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-semibold shadow-lg shadow-amber-400/30 border-0"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
          <Button variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 bg-transparent">
            <Link href="/student/dashboard">
              <Home className="h-4 w-4 mr-2" />
              My Courses
            </Link>
          </Button>
        </div>
      </div>

      {/* Certificate */}
      <div
        id="certificate-wrapper"
        style={{
          transform: certVisible ? "translateY(0)" : "translateY(40px)",
          opacity: certVisible ? 1 : 0,
          transition: "transform 0.8s cubic-bezier(0.34,1.2,0.64,1), opacity 0.6s ease",
          width: "100%",
          maxWidth: "820px",
        }}
      >
        {cert.templateImageUrl ? (
          <div
            id="certificate"
            className="relative overflow-hidden mx-auto"
            style={{
              width: "100%",
              aspectRatio: "297 / 210",
              backgroundImage: `url(${cert.templateImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
              borderRadius: "8px",
            }}
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
                }}
              >
                {fieldValues[field.key] ?? ""}
              </div>
            ))}
          </div>
        ) : (
          /* Default certificate design */
          <div
            id="certificate"
            className="bg-white mx-auto print:shadow-none"
            style={{
              boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
              border: "2px solid #c6a84b",
              borderRadius: "6px",
            }}
          >
            <div className="absolute inset-3 pointer-events-none" style={{ border: "1px solid #c6a84b", borderRadius: "4px", position: "absolute" }} />

            {/* Corner ornaments */}
            {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
              <svg key={pos} className={`absolute ${pos} w-8 h-8`} viewBox="0 0 40 40" fill="none">
                <path d="M2 20 L2 2 L20 2" stroke="#c6a84b" strokeWidth="1.5" fill="none" />
                <circle cx="2" cy="2" r="2" fill="#c6a84b" />
              </svg>
            ))}

            <div className="relative px-12 pt-12 pb-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400" />
                <img src="/logo.png" alt="DNA Worldwide" className="h-10 w-auto flex-shrink-0" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 mb-1">DNA Worldwide</p>

              <h1 className="text-4xl font-bold mb-3 mt-4" style={{ color: "#1a2c5b", fontFamily: "Georgia, serif" }}>
                Certificate of Completion
              </h1>

              <div className="flex items-center justify-center gap-3 mt-1 mb-6">
                <div className="h-px w-20 bg-amber-400" />
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <div className="h-px w-20 bg-amber-400" />
              </div>

              <p className="text-sm text-slate-500 tracking-wide mb-3">This is to certify that</p>

              <p className="text-4xl mb-4 leading-tight" style={{
                color: "#1a3a8f", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700,
                borderBottom: "2px solid #c6a84b", display: "inline-block",
                paddingBottom: "6px", paddingLeft: "24px", paddingRight: "24px",
              }}>
                {cert.studentName}
              </p>

              <p className="text-sm text-slate-500 mt-5 mb-1 tracking-wide">has successfully completed the course</p>

              <h2 className="text-2xl font-bold mb-6" style={{ color: "#1a2c5b", fontFamily: "Georgia, serif" }}>
                {cert.courseTitle}
              </h2>

              <div className="flex items-end justify-between mt-4 mb-2 gap-8">
                <div className="text-center flex-1">
                  <div className="border-t border-slate-300 pt-2 mt-6">
                    <p className="text-sm font-semibold text-slate-700">{formatDate(cert.issuedAt)}</p>
                    <p className="text-xs text-slate-400 mt-0.5 tracking-wide uppercase">Date Issued</p>
                  </div>
                </div>
                <div className="flex flex-col items-center flex-shrink-0">
                  <svg viewBox="0 0 96 96" className="w-16 h-16" fill="none">
                    <circle cx="48" cy="48" r="46" stroke="#c6a84b" strokeWidth="2" fill="none" />
                    <circle cx="48" cy="48" r="40" stroke="#c6a84b" strokeWidth="0.5" fill="none" strokeDasharray="3 2" />
                    <circle cx="48" cy="48" r="34" fill="#fffbeb" stroke="#c6a84b" strokeWidth="1" />
                    <path d="M48 20l5.56 11.27L66 32.73l-9 8.77 2.12 12.38L48 47.77l-11.12 6.11L39 41.5 30 32.73l12.44-1.46L48 20z" fill="#c6a84b" />
                    <text x="48" y="70" textAnchor="middle" fontSize="7" fill="#92742a" fontFamily="Georgia,serif" letterSpacing="1">CERTIFIED</text>
                  </svg>
                </div>
                <div className="text-center flex-1">
                  <div className="border-t border-slate-300 pt-2 mt-6">
                    <p className="text-sm font-semibold text-slate-700">{cert.instructorName}</p>
                    <p className="text-xs text-slate-400 mt-0.5 tracking-wide uppercase">Instructor</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-12 py-3" style={{ borderTop: "1px solid #e5d99a", backgroundColor: "#fdfbf0" }}>
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

        {/* Bottom actions (print-hidden) */}
        <div className="flex items-center justify-center gap-3 mt-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-lg text-sm font-semibold shadow-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Download / Print Certificate
          </button>
          <Link
            href={`/certificates/${cert.verificationCode}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 rounded-lg text-sm transition-colors"
          >
            View shareable link →
          </Link>
        </div>
      </div>

      {/* Print-only: clean white background */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) translateY(-52px); } to { transform: rotate(360deg) translateY(-52px); } }
        @media print {
          body { background: white !important; }
          #certificate-wrapper { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
