"use client";

import { useState } from "react";
import { downloadCertificatePdf, downloadTemplateCertificatePdf } from "@/lib/download-certificate";
import type { TemplateField } from "@/lib/certificate-defaults";

interface CertificateDownloadButtonProps {
  filename: string;
  templateImageUrl?: string | null;
  fields?: TemplateField[];
  fieldValues?: Record<string, string>;
}

export function CertificateDownloadButton({ filename, templateImageUrl, fields, fieldValues }: CertificateDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    setError(false);
    try {
      if (templateImageUrl && fields && fieldValues) {
        await downloadTemplateCertificatePdf("certificate", templateImageUrl, fields, fieldValues, filename);
      } else {
        await downloadCertificatePdf("certificate", filename);
      }
    } catch {
      setError(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark shadow-sm transition-colors disabled:opacity-60"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
        </svg>
        {downloading ? "Generating..." : "Download Certificate"}
      </button>
      {error && <p className="text-xs text-red-600 mt-2">Couldn&apos;t generate the certificate — please try again.</p>}
    </div>
  );
}
