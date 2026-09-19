import { google, type sheets_v4 } from "googleapis";
import { db } from "@/lib/db";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;

// Staff and tender clients are reported separately, each on its own tab, so the
// original Sheet1 grid keeps its history untouched. Admins are internal and excluded.
const ROLE_TABS = [
  { role: "STAFF", tab: "Staff", label: "Staff" },
  { role: "TENDER", tab: "Tender", label: "Tender Clients" },
] as const;

const FIXED_COLUMNS = ["Name", "Email", "Last login"];
const NEVER_LOGGED_IN = "Never logged in";
const TICK = "✓";

// Brand palette, matching the portal and the transactional emails.
const NAVY = { red: 0.11, green: 0.31, blue: 0.55 };
const NAVY_DARK = { red: 0.06, green: 0.21, blue: 0.39 };
const WHITE = { red: 1, green: 1, blue: 1 };
const BAND = { red: 0.97, green: 0.98, blue: 0.99 };
const GRID_LINE = { red: 0.85, green: 0.88, blue: 0.91 };
const GREEN = { red: 0.06, green: 0.6, blue: 0.4 };
const GREEN_TINT = { red: 0.85, green: 0.96, blue: 0.9 };
const RED = { red: 0.72, green: 0.16, blue: 0.16 };
const RED_TINT = { red: 0.99, green: 0.91, blue: 0.91 };

function getAuthClient() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

/** "19 Sep 2026, 14:32" — readable in the sheet without needing a cell format. */
function formatDateTime(value: Date | null): string {
  if (!value) return NEVER_LOGGED_IN;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  })
    .format(value)
    .replace(",", "");
}

function buildGrid(
  enrollments: {
    completedAt: Date | null;
    student: { id: string; name: string; email: string; lastLoginAt: Date | null };
    course: { title: string };
  }[]
) {
  // Course columns: every course somebody is enrolled in, alphabetical.
  const courses = [...new Set(enrollments.map((e) => e.course.title))].sort((a, b) => a.localeCompare(b));

  const byStudent = new Map<
    string,
    { name: string; email: string; lastLoginAt: Date | null; completed: Set<string> }
  >();
  for (const e of enrollments) {
    let row = byStudent.get(e.student.id);
    if (!row) {
      row = {
        name: e.student.name,
        email: e.student.email,
        lastLoginAt: e.student.lastLoginAt,
        completed: new Set<string>(),
      };
      byStudent.set(e.student.id, row);
    }
    if (e.completedAt) row.completed.add(e.course.title);
  }

  const rows = [...byStudent.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((s) => [
      s.name,
      s.email,
      formatDateTime(s.lastLoginAt),
      // Tick where completed; blank otherwise. In-progress detail lives in the admin panel.
      ...courses.map((c) => (s.completed.has(c) ? TICK : "")),
    ]);

  return { courses, rows };
}

export async function syncCourseProgressToSheet() {
  const enrollments = await db.enrollment.findMany({
    where: { student: { role: { in: ["STAFF", "TENDER"] } } },
    select: {
      completedAt: true,
      student: { select: { id: true, name: true, email: true, role: true, lastLoginAt: true } },
      course: { select: { title: true } },
    },
  });

  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });

  for (const { role, tab, label } of ROLE_TABS) {
    await writeTab(
      sheets,
      meta.data,
      tab,
      label,
      enrollments.filter((e) => e.student.role === role)
    );
  }
}

type SheetsClient = sheets_v4.Sheets;

async function writeTab(
  sheets: SheetsClient,
  meta: sheets_v4.Schema$Spreadsheet,
  tabName: string,
  label: string,
  enrollments: Parameters<typeof buildGrid>[0]
) {
  const { courses, rows } = buildGrid(enrollments);
  const header = [...FIXED_COLUMNS, ...courses];
  const totalCols = header.length;
  const totalRows = rows.length + 2; // title row + header row

  const existing = meta.sheets?.find((s) => s.properties?.title === tabName);
  let sheetId = existing?.properties?.sheetId;

  if (sheetId === undefined || sheetId === null) {
    const created = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] },
    });
    sheetId = created.data.replies?.[0]?.addSheet?.properties?.sheetId ?? undefined;
  }
  if (sheetId === undefined || sheetId === null) throw new Error(`Could not resolve sheetId for ${tabName}`);

  // Banding and conditional rules aren't cleared by wiping cell formats, so remove
  // exactly the ones already on the tab or they stack up with every sync.
  const bandedRangeIds = (existing?.bandedRanges ?? [])
    .map((b) => b.bandedRangeId)
    .filter((id): id is number => typeof id === "number");
  const conditionalRuleCount = existing?.conditionalFormats?.length ?? 0;

  const title = `DNA Worldwide — ${label} Course Completions   ·   updated ${formatDateTime(new Date())}`;

  await sheets.spreadsheets.values.clear({ spreadsheetId: SPREADSHEET_ID, range: tabName });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [[title], header, ...rows] },
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: formatRequests(sheetId, totalRows, totalCols, bandedRangeIds, conditionalRuleCount),
    },
  });
}

function formatRequests(
  sheetId: number,
  totalRows: number,
  totalCols: number,
  bandedRangeIds: number[],
  conditionalRuleCount: number
) {
  const dataStart = 2; // rows 0-1 are the title and header
  // A tab with nobody on it, or nobody enrolled in anything, has no body/course
  // ranges to style — the API rejects zero-width ranges, so those requests are dropped.
  const hasRows = totalRows > dataStart;
  const hasCourses = totalCols > FIXED_COLUMNS.length;
  const bodyOnly = <T>(requests: T[]) => (hasRows ? requests : []);
  const gridOnly = <T>(requests: T[]) => (hasRows && hasCourses ? requests : []);

  return [
    // Reset anything left by a previous sync before re-applying.
    { updateCells: { range: { sheetId }, fields: "userEnteredFormat" } },
    { unmergeCells: { range: { sheetId } } },
    ...bandedRangeIds.map((bandedRangeId) => ({ deleteBanding: { bandedRangeId } })),
    // Deleting shifts indexes down, so always remove from the end.
    ...Array.from({ length: conditionalRuleCount }, (_, i) => ({
      deleteConditionalFormatRule: { sheetId, index: conditionalRuleCount - 1 - i },
    })),

    // Title banner across the full width. Deliberately not merged: a merged cell
    // spanning the frozen columns is rejected, and unmerged text overflows anyway.
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: {
          userEnteredFormat: {
            backgroundColor: NAVY_DARK,
            horizontalAlignment: "LEFT",
            verticalAlignment: "MIDDLE",
            padding: { left: 12 },
            textFormat: { foregroundColor: WHITE, bold: true, fontSize: 13 },
          },
        },
        fields: "userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment,padding,textFormat)",
      },
    },
    { updateDimensionProperties: { range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 }, properties: { pixelSize: 38 }, fields: "pixelSize" } },

    // Header row.
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: totalCols },
        cell: {
          userEnteredFormat: {
            backgroundColor: NAVY,
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            textFormat: { foregroundColor: WHITE, bold: true, fontSize: 10 },
          },
        },
        fields: "userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment,wrapStrategy,textFormat)",
      },
    },
    // Name/Email/Last login read better left-aligned than the course columns.
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: 3 },
        cell: { userEnteredFormat: { horizontalAlignment: "LEFT" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    },
    { updateDimensionProperties: { range: { sheetId, dimension: "ROWS", startIndex: 1, endIndex: 2 }, properties: { pixelSize: 46 }, fields: "pixelSize" } },

    // Body: centre the course grid, bold the name column.
    ...gridOnly([
      {
        repeatCell: {
          range: { sheetId, startRowIndex: dataStart, endRowIndex: totalRows, startColumnIndex: 3, endColumnIndex: totalCols },
          cell: { userEnteredFormat: { horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE", textFormat: { fontSize: 11, bold: true } } },
          fields: "userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)",
        },
      },
    ]),
    ...bodyOnly([
      {
        repeatCell: {
          range: { sheetId, startRowIndex: dataStart, endRowIndex: totalRows, startColumnIndex: 0, endColumnIndex: 1 },
          cell: { userEnteredFormat: { textFormat: { bold: true }, verticalAlignment: "MIDDLE" } },
          fields: "userEnteredFormat(textFormat,verticalAlignment)",
        },
      },
      {
        repeatCell: {
          range: { sheetId, startRowIndex: dataStart, endRowIndex: totalRows, startColumnIndex: 1, endColumnIndex: 3 },
          cell: { userEnteredFormat: { verticalAlignment: "MIDDLE", textFormat: { fontSize: 10 } } },
          fields: "userEnteredFormat(verticalAlignment,textFormat)",
        },
      },
      { updateDimensionProperties: { range: { sheetId, dimension: "ROWS", startIndex: dataStart, endIndex: totalRows }, properties: { pixelSize: 30 }, fields: "pixelSize" } },

      // Zebra striping for readability across wide course grids.
      {
        addBanding: {
          bandedRange: {
            range: { sheetId, startRowIndex: dataStart, endRowIndex: totalRows, startColumnIndex: 0, endColumnIndex: totalCols },
            rowProperties: { firstBandColor: WHITE, secondBandColor: BAND },
          },
        },
      },
      // Flag anyone who has never signed in.
      {
        addConditionalFormatRule: {
          index: 0,
          rule: {
            ranges: [{ sheetId, startRowIndex: dataStart, endRowIndex: totalRows, startColumnIndex: 2, endColumnIndex: 3 }],
            booleanRule: {
              condition: { type: "TEXT_EQ", values: [{ userEnteredValue: NEVER_LOGGED_IN }] },
              format: { backgroundColor: RED_TINT, textFormat: { foregroundColor: RED, bold: true, italic: true } },
            },
          },
        },
      },
    ]),

    // Green ticks.
    ...gridOnly([
      {
        addConditionalFormatRule: {
          index: 0,
          rule: {
            ranges: [{ sheetId, startRowIndex: dataStart, endRowIndex: totalRows, startColumnIndex: 3, endColumnIndex: totalCols }],
            booleanRule: {
              condition: { type: "TEXT_EQ", values: [{ userEnteredValue: TICK }] },
              format: { backgroundColor: GREEN_TINT, textFormat: { foregroundColor: GREEN, bold: true } },
            },
          },
        },
      },
    ]),

    { updateBorders: {
        range: { sheetId, startRowIndex: 1, endRowIndex: totalRows, startColumnIndex: 0, endColumnIndex: totalCols },
        innerHorizontal: { style: "SOLID", color: GRID_LINE },
        innerVertical: { style: "SOLID", color: GRID_LINE },
    } },

    // Keep identity columns and headings visible while scrolling the course grid.
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 2, frozenColumnCount: 3 } },
        fields: "gridProperties(frozenRowCount,frozenColumnCount)",
      },
    },
    { autoResizeDimensions: { dimensions: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: totalCols } } },
  ];
}
