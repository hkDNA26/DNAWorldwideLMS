import ExcelJS from "exceljs";

export interface ParsedQuestion {
  questionText: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  options: { text: string; isCorrect: boolean }[];
}

export interface ParsedPart {
  partNumber: number;
  title: string;
  videoUrl: string;
  questions: ParsedQuestion[];
}

export interface ParsedCourse {
  title: string;
  description: string;
  estimatedTime: string | null;
  bannerImageUrl: string | null;
}

export interface ParsedWorkbook {
  course: ParsedCourse;
  parts: ParsedPart[];
}

type ParseResult = { data: ParsedWorkbook; errors?: never } | { data?: never; errors: string[] };

const OPTION_COLUMNS = [5, 6, 7, 8] as const; // Option A..D
const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

function cellString(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  if (typeof v === "object") {
    const obj = v as unknown as Record<string, unknown>;
    if (typeof obj.hyperlink === "string") return obj.hyperlink.trim();
    if (typeof obj.text === "string") return obj.text.trim();
    if (Array.isArray(obj.richText)) {
      return (obj.richText as { text: string }[]).map((t) => t.text).join("").trim();
    }
  }
  return String(v).trim();
}

function isExampleRow(text: string): boolean {
  return text.toLowerCase().startsWith("example");
}

/** Returns non-header, non-blank, non-sample data rows. `labelColumn` is the
 * column holding the human-readable text used to detect the sample row
 * (title/question text) — it varies per sheet since column 1 isn't always it. */
function dataRows(sheet: ExcelJS.Worksheet, labelColumn: number): ExcelJS.Row[] {
  const rows: ExcelJS.Row[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const label = cellString(row.getCell(labelColumn));
    if (!label || isExampleRow(label)) return;
    rows.push(row);
  });
  return rows;
}

export async function parseCourseWorkbook(buffer: Buffer): Promise<ParseResult> {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  } catch {
    return { errors: ["This doesn't look like a valid .xlsx file."] };
  }

  const courseInfoSheet = workbook.getWorksheet("Course Info");
  const partsSheet = workbook.getWorksheet("Parts");
  const quizSheet = workbook.getWorksheet("Quiz Questions");

  const errors: string[] = [];
  if (!courseInfoSheet) errors.push('Missing "Course Info" sheet — please use the downloaded template.');
  if (!partsSheet) errors.push('Missing "Parts" sheet — please use the downloaded template.');
  if (!quizSheet) errors.push('Missing "Quiz Questions" sheet — please use the downloaded template.');
  if (errors.length > 0) return { errors };

  // ---- Course Info --------------------------------------------------------
  const courseRow = dataRows(courseInfoSheet!, 1)[0]; // col 1 = Course Title
  if (!courseRow) {
    errors.push('"Course Info" sheet: fill in the course title, description, estimated time, and banner image.');
  }

  const title = courseRow ? cellString(courseRow.getCell(1)) : "";
  const description = courseRow ? cellString(courseRow.getCell(2)) : "";
  const estimatedTime = courseRow ? cellString(courseRow.getCell(3)) : "";
  const bannerImageUrl = courseRow ? cellString(courseRow.getCell(4)) : "";

  if (courseRow && !title) errors.push('"Course Info": Course Title is required.');
  if (courseRow && !bannerImageUrl) errors.push('"Course Info": Banner Image link is required.');

  // ---- Parts ---------------------------------------------------------------
  const partRows = dataRows(partsSheet!, 2); // col 2 = Part Title
  if (partRows.length === 0) {
    errors.push('"Parts" sheet: add at least one part with a video link.');
  }

  const parts: ParsedPart[] = [];
  const seenPartNumbers = new Set<number>();

  for (const row of partRows) {
    const rowLabel = `"Parts" row ${row.number}`;
    const partNumberRaw = cellString(row.getCell(1));
    const partTitle = cellString(row.getCell(2));
    const videoUrl = cellString(row.getCell(3));

    const partNumber = Number(partNumberRaw);
    if (!partNumberRaw || !Number.isInteger(partNumber) || partNumber <= 0) {
      errors.push(`${rowLabel}: Part Number must be a positive whole number.`);
      continue;
    }
    if (seenPartNumbers.has(partNumber)) {
      errors.push(`${rowLabel}: Part Number ${partNumber} is used more than once.`);
      continue;
    }
    if (!partTitle) {
      errors.push(`${rowLabel}: Part Title is required.`);
      continue;
    }
    if (!videoUrl) {
      errors.push(`${rowLabel}: Video Link is required.`);
      continue;
    }

    seenPartNumbers.add(partNumber);
    parts.push({ partNumber, title: partTitle, videoUrl, questions: [] });
  }

  parts.sort((a, b) => a.partNumber - b.partNumber);
  const partByNumber = new Map(parts.map((p) => [p.partNumber, p]));

  // ---- Quiz Questions --------------------------------------------------------
  const questionRows = dataRows(quizSheet!, 4); // col 4 = Question Text

  for (const row of questionRows) {
    const rowLabel = `"Quiz Questions" row ${row.number}`;
    const partNumber = Number(cellString(row.getCell(1)));
    const questionTypeRaw = cellString(row.getCell(3)).toLowerCase();
    const questionText = cellString(row.getCell(4));
    const correctAnswer = cellString(row.getCell(9)).toUpperCase();

    const part = partByNumber.get(partNumber);
    if (!part) {
      errors.push(`${rowLabel}: Part Number ${partNumber || "(blank)"} doesn't match any row in the "Parts" sheet.`);
      continue;
    }
    if (!questionText) {
      errors.push(`${rowLabel}: Question Text is required.`);
      continue;
    }

    const isTrueFalse = questionTypeRaw === "true/false" || questionTypeRaw === "true / false";
    const isMultipleChoice = questionTypeRaw === "multiple choice";
    if (!isTrueFalse && !isMultipleChoice) {
      errors.push(`${rowLabel}: Question Type must be "Multiple Choice" or "True/False".`);
      continue;
    }

    if (isTrueFalse) {
      if (correctAnswer !== "TRUE" && correctAnswer !== "FALSE") {
        errors.push(`${rowLabel}: Correct Answer must be "True" or "False" for a True/False question.`);
        continue;
      }
      part.questions.push({
        questionText,
        type: "TRUE_FALSE",
        options: [
          { text: "True", isCorrect: correctAnswer === "TRUE" },
          { text: "False", isCorrect: correctAnswer === "FALSE" },
        ],
      });
      continue;
    }

    const options = OPTION_COLUMNS.map((col) => cellString(row.getCell(col))).filter((text) => text.length > 0);
    if (options.length < 2) {
      errors.push(`${rowLabel}: needs at least 2 filled-in options.`);
      continue;
    }

    const correctIndex = OPTION_LETTERS.indexOf(correctAnswer as (typeof OPTION_LETTERS)[number]);
    if (correctIndex === -1 || correctIndex >= options.length) {
      errors.push(`${rowLabel}: Correct Answer must be the letter of one of the filled-in options (A-${OPTION_LETTERS[options.length - 1]}).`);
      continue;
    }

    part.questions.push({
      questionText,
      type: "MULTIPLE_CHOICE",
      options: options.map((text, i) => ({ text, isCorrect: i === correctIndex })),
    });
  }

  if (errors.length > 0) return { errors };

  return {
    data: {
      course: {
        title,
        description,
        estimatedTime: estimatedTime || null,
        bannerImageUrl: bannerImageUrl || null,
      },
      parts,
    },
  };
}
