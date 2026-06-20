export interface TemplateField {
  key: string;
  label: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bold: boolean;
  align: "left" | "center" | "right";
}

export const DEFAULT_FIELDS: TemplateField[] = [
  { key: "studentName",    label: "Student Name",    x: 50, y: 38, fontSize: 42, color: "#1a3a8f", bold: true,  align: "center" },
  { key: "courseTitle",    label: "Course Title",     x: 50, y: 52, fontSize: 22, color: "#1a2c5b", bold: true,  align: "center" },
  { key: "issuedDate",     label: "Date Issued",      x: 25, y: 76, fontSize: 14, color: "#374151", bold: false, align: "center" },
  { key: "instructorName", label: "Instructor Name",  x: 75, y: 76, fontSize: 14, color: "#374151", bold: false, align: "center" },
  { key: "certificateId",  label: "Certificate ID",   x: 50, y: 88, fontSize: 10, color: "#6b7280", bold: false, align: "center" },
];

/** Formats the raw verificationCode into a readable cert number, e.g. DNA-2026-A3F8C2 */
export function formatCertificateId(verificationCode: string, issuedAt: Date | string): string {
  const year = new Date(issuedAt).getUTCFullYear();
  const short = verificationCode.slice(-6).toUpperCase();
  return `DNA-${year}-${short}`;
}
