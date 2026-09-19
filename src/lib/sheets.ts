import { google } from "googleapis";
import { db } from "@/lib/db";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;

// Written to its own tab so the original Sheet1 grid keeps its history untouched.
const PROGRESS_SHEET_NAME = "Course Progress";

const HEADER = ["Name", "Email", "Role", "Course", "Status", "Started", "Completed"];

function getAuthClient() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function formatDate(value: Date | null): string {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

/**
 * Mirrors every enrollment into the progress tab, one row each, so the sheet answers
 * both "who has completed" and "who hasn't". Rewrites the whole tab rather than
 * patching cells: the sheet can't drift out of sync if an individual write is missed.
 */
export async function syncCourseProgressToSheet() {
  const enrollments = await db.enrollment.findMany({
    select: {
      firstAccessedAt: true,
      completedAt: true,
      student: { select: { name: true, email: true, role: true } },
      course: { select: { title: true } },
    },
  });

  const rows = enrollments
    .map((e) => ({
      name: e.student.name,
      email: e.student.email,
      role: e.student.role,
      course: e.course.title,
      status: e.completedAt ? "Completed" : e.firstAccessedAt ? "In progress" : "Not started",
      started: formatDate(e.firstAccessedAt),
      completed: formatDate(e.completedAt),
    }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.course.localeCompare(b.course))
    .map((r) => [r.name, r.email, r.role, r.course, r.status, r.started, r.completed]);

  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const tabExists = meta.data.sheets?.some((s) => s.properties?.title === PROGRESS_SHEET_NAME);
  if (!tabExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: PROGRESS_SHEET_NAME } } }] },
    });
  }

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: PROGRESS_SHEET_NAME,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${PROGRESS_SHEET_NAME}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [HEADER, ...rows] },
  });
}
