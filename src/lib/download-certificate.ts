import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { TemplateField } from "@/lib/certificate-defaults";

const PAGE_WIDTH_MM = 297;
const MM_TO_PT = 72 / 25.4;
// Print-quality at A4 landscape width without ballooning file size — jsPDF's
// "compression" option only tunes DEFLATE effort on the still-lossless PNG
// stream, so the real lever for file size is re-encoding to JPEG at a
// sensible resolution before embedding.
const MAX_EMBED_WIDTH_PX = 2000;
const JPEG_QUALITY = 0.9;

/** Loads an image and re-encodes it as a size-capped JPEG data URL, to keep
 * the generated PDF from ballooning to tens of MB when embedding a
 * high-resolution (e.g. print-ready 3500px+) certificate template. */
async function loadAndCompressImage(url: string): Promise<{ dataUrl: string; width: number; height: number }> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error(`Failed to load ${url}`));
    el.src = url;
  });

  const scale = Math.min(1, MAX_EMBED_WIDTH_PX / img.naturalWidth);
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return { dataUrl: canvas.toDataURL("image/jpeg", JPEG_QUALITY), width, height };
}

/** Captures a DOM node and saves it as a PDF sized to match its own aspect
 * ratio, instead of routing through window.print() — the browser's print
 * pipeline imposes its own page size/orientation/margins (typically
 * portrait Letter/A4), which crops a landscape certificate into a small box
 * on a mostly-blank page. Used for the built-in (non-template) certificate
 * design, which has no simple background+fields structure to render
 * natively. */
export async function downloadCertificatePdf(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Certificate element not found");

  await document.fonts.ready;

  const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const heightMm = (canvas.height / canvas.width) * PAGE_WIDTH_MM;

  const pdf = new jsPDF({
    orientation: heightMm > PAGE_WIDTH_MM ? "portrait" : "landscape",
    unit: "mm",
    format: [PAGE_WIDTH_MM, heightMm],
  });

  pdf.addImage(canvas.toDataURL("image/jpeg", JPEG_QUALITY), "JPEG", 0, 0, PAGE_WIDTH_MM, heightMm);
  pdf.save(filename);
}

/** Resolves any CSS color value (including var(--...) custom properties)
 * to its actual [r, g, b], using the browser's own resolution rather than
 * re-implementing CSS variable lookup. */
function resolveCssColorRgb(color: string): [number, number, number] {
  const probe = document.createElement("div");
  probe.style.color = color;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  const match = resolved.match(/[\d.]+/g);
  if (!match || match.length < 3) return [0, 0, 0];
  return [Number(match[0]), Number(match[1]), Number(match[2])];
}

/** Renders a template-based certificate (background image + positioned text
 * fields) as native PDF content instead of an html2canvas screenshot.
 * html2canvas doesn't reproduce the browser's exact text baseline/
 * line-height math, which shows up as short dynamic fields (date,
 * certificate ID) drifting a few pixels and crossing decorative lines baked
 * into the template artwork — drawing the text natively with jsPDF avoids
 * that class of bug entirely and keeps positioning pixel/point-exact. */
export async function downloadTemplateCertificatePdf(
  containerId: string,
  imageUrl: string,
  fields: TemplateField[],
  fieldValues: Record<string, string>,
  filename: string
): Promise<void> {
  const container = document.getElementById(containerId);
  if (!container) throw new Error("Certificate element not found");
  const referenceWidthPx = container.getBoundingClientRect().width;

  const { dataUrl, width, height } = await loadAndCompressImage(imageUrl);
  const heightMm = (height / width) * PAGE_WIDTH_MM;
  const pxPerMm = referenceWidthPx / PAGE_WIDTH_MM;

  const pdf = new jsPDF({
    orientation: heightMm > PAGE_WIDTH_MM ? "portrait" : "landscape",
    unit: "mm",
    format: [PAGE_WIDTH_MM, heightMm],
  });

  pdf.addImage(dataUrl, "JPEG", 0, 0, PAGE_WIDTH_MM, heightMm);

  for (const field of fields) {
    const value = fieldValues[field.key];
    if (!value) continue;

    const [r, g, b] = resolveCssColorRgb(field.color);
    pdf.setTextColor(r, g, b);
    pdf.setFont("helvetica", field.bold ? "bold" : "normal");
    pdf.setFontSize((field.fontSize / pxPerMm) * MM_TO_PT);
    pdf.text(value, (field.x / 100) * PAGE_WIDTH_MM, (field.y / 100) * heightMm, {
      align: field.align,
      baseline: "middle",
    });
  }

  pdf.save(filename);
}
