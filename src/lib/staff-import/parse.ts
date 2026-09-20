import ExcelJS from "exceljs";

export const STAFF_SHEET_NAME = "Staff";
export const STAFF_COLUMNS = ["Name", "Email"] as const;

export interface ParsedStaffRow {
  row: number;
  name: string;
  email: string;
}

export interface StaffRowProblem {
  row: number;
  value: string;
  reason: string;
}

export interface ParsedStaffSheet {
  valid: ParsedStaffRow[];
  problems: StaffRowProblem[];
}

/** Deliberately permissive: real addresses vary far more than a strict RFC pattern
 * allows, and the point here is to catch obvious typos (missing @, trailing comma)
 * rather than to adjudicate exotic-but-legal addresses. */
const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/;

function cellString(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v === null || v === undefined) return "";
  // A pasted address often lands as a hyperlink object rather than a plain string.
  if (typeof v === "object" && "text" in v) return String((v as { text: unknown }).text).trim();
  if (typeof v === "object" && "hyperlink" in v) return String((v as { hyperlink: unknown }).hyperlink).replace(/^mailto:/i, "").trim();
  return String(v).trim();
}

export async function parseStaffWorkbook(
  buffer: Buffer
): Promise<{ data: ParsedStaffSheet; errors?: never } | { data?: never; errors: string[] }> {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  } catch {
    return { errors: ["This doesn't look like a valid .xlsx file."] };
  }

  // Fall back to the first sheet: people rename tabs, and failing on that alone
  // would be needlessly strict when the columns are what actually matter.
  const sheet = workbook.getWorksheet(STAFF_SHEET_NAME) ?? workbook.worksheets[0];
  if (!sheet) return { errors: ["That spreadsheet has no sheets in it."] };

  const valid: ParsedStaffRow[] = [];
  const problems: StaffRowProblem[] = [];
  const seen = new Map<string, number>();

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // header

    const name = cellString(row.getCell(1));
    const email = cellString(row.getCell(2)).toLowerCase();

    if (!name && !email) return; // blank spacer row

    if (!name) {
      problems.push({ row: rowNumber, value: email, reason: "No name given" });
      return;
    }
    if (!email) {
      problems.push({ row: rowNumber, value: name, reason: "No email given" });
      return;
    }
    if (!EMAIL_RE.test(email)) {
      problems.push({ row: rowNumber, value: email, reason: "Doesn't look like a valid email" });
      return;
    }

    const firstSeenAt = seen.get(email);
    if (firstSeenAt) {
      problems.push({ row: rowNumber, value: email, reason: `Duplicate of row ${firstSeenAt}` });
      return;
    }

    seen.set(email, rowNumber);
    valid.push({ row: rowNumber, name, email });
  });

  if (valid.length === 0 && problems.length === 0) {
    return { errors: ["No rows found. Add a Name and Email for each person under the header row."] };
  }

  return { data: { valid, problems } };
}

/** The blank workbook offered as a download, so nobody has to guess the layout. */
export async function buildStaffTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(STAFF_SHEET_NAME);

  sheet.columns = [
    { header: "Name", key: "name", width: 32 },
    { header: "Email", key: "email", width: 42 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.addRow({ name: "Jane Smith", email: "jane.smith@example.com" });
  sheet.addRow({ name: "Tom Jones", email: "tom.jones@example.com" });

  const note = sheet.getCell("D2");
  note.value = "Replace the example rows with your staff. Everyone in this file gets the same role, courses and resources — you choose those on the upload screen.";
  note.alignment = { wrapText: true, vertical: "top" };
  sheet.getColumn(4).width = 60;

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
