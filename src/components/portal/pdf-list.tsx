import { FileText, Download, Eye, Image as ImageIcon, Film, Presentation, type LucideIcon } from "lucide-react";
import { formatFileSize } from "@/lib/format";

export interface PdfListItem {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
  mimeType?: string | null;
}

function iconFor(mime: string | null | undefined, fileName: string): LucideIcon {
  const m = mime ?? "";
  const f = fileName.toLowerCase();
  if (m.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/.test(f)) return ImageIcon;
  if (m.startsWith("video/") || /\.(mp4|webm|mov)$/.test(f)) return Film;
  if (m.includes("presentation") || m.includes("powerpoint") || /\.(pptx?|potx)$/.test(f)) return Presentation;
  return FileText;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function PdfList({ documents, emptyLabel }: { documents: PdfListItem[]; emptyLabel: string }) {
  if (documents.length === 0) {
    return (
      <div className="bg-white border border-line rounded-2xl p-8 text-center text-ink-faint text-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {documents.map((doc, i) => {
        const Icon = iconFor(doc.mimeType, doc.fileName);
        return (
        <li
          key={doc.id}
          className="bg-white border border-line rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-4 animate-brand-card-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center text-brand shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-ink truncate">{doc.title}</p>
            <p className="text-[12.5px] text-ink-faint mt-0.5">
              {dateFmt.format(doc.createdAt)} &middot; {formatFileSize(doc.fileSize)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-semibold text-ink-soft hover:bg-paper hover:text-ink transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View</span>
            </a>
            <a
              href={doc.fileUrl}
              download={doc.fileName}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white hover:bg-brand-dark transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        </li>
        );
      })}
    </ul>
  );
}
