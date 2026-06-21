import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;
const SHEET_NAME = "Sheet1";

function getAuthClient() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

// Convert zero-based column index to spreadsheet letter (0→A, 1→B, 26→AA, etc.)
function colLetter(index: number): string {
  let col = "";
  let i = index + 1;
  while (i > 0) {
    const rem = (i - 1) % 26;
    col = String.fromCharCode(65 + rem) + col;
    i = Math.floor((i - 1) / 26);
  }
  return col;
}

export async function recordCourseCompletion(studentName: string, courseTitle: string) {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  // Read the entire sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_NAME,
  });

  const rows: string[][] = (res.data.values as string[][] | null) ?? [];

  // If the sheet is empty, bootstrap it
  if (rows.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [["Name", courseTitle], [studentName, "✓"]] },
    });
    return;
  }

  const headerRow = rows[0];

  // Find or create the course column
  let courseColIdx = headerRow.findIndex(
    (h) => h.trim().toLowerCase() === courseTitle.trim().toLowerCase()
  );
  if (courseColIdx === -1) {
    courseColIdx = headerRow.length;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!${colLetter(courseColIdx)}1`,
      valueInputOption: "RAW",
      requestBody: { values: [[courseTitle]] },
    });
  }

  // Find the student row (rows[0] is the header, so students start at rows[1])
  let studentRowIdx = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0]?.trim().toLowerCase() === studentName.trim().toLowerCase()) {
      studentRowIdx = i;
      break;
    }
  }

  const courseCol = colLetter(courseColIdx);

  if (studentRowIdx === -1) {
    // Student not found — append a new row with a tick in the correct column
    const newRow = Array(courseColIdx + 1).fill("");
    newRow[0] = studentName;
    newRow[courseColIdx] = "✓";
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
      valueInputOption: "RAW",
      requestBody: { values: [newRow] },
    });
  } else {
    // Student found — update their cell for this course
    const sheetRow = studentRowIdx + 1; // Sheets API is 1-based
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!${courseCol}${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: { values: [["✓"]] },
    });
  }
}
