const { google } = require("googleapis");
const path = require("path");

const CREDS = path.resolve(__dirname, "../credentials/service-account.json");
const SHEET_ID = "112SYnCNlWsAyzC0yxNHj-pLh-WdKJqyev-ZSxrPiDLg";

// Only the general staff-facing FAQ topics from "Dashboard Back end" — not the
// case-specific report-writing boilerplate mixed into the same block, and not the
// glossary/reference/sample-type tables elsewhere in the tab.
const WANTED = [
  "Child Questions",
  "Braid Questions",
  "Why do we test Methamphetamine and Amphetamine together?",
  "Why do we need to test EtG & FAEE alongside?",
  "Testing <3cm for Alcohol",
  "Testing >6cm for Alcohol",
  "Segmenting Hair for Excessive Alcohol Consumption",
  "why PEth tests only cover the last 28 days and not longer",
  "Effect of Pregnancy",
  "Longer hair test",
  "Hair severely chemically treated",
];

function cleanMultiline(s) {
  return (s || "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Dashboard Back end!A80:B155",
  });
  const rows = res.data.values || [];

  const out = [];
  const seen = new Set();
  for (const wanted of WANTED) {
    const row = rows.find((r) => (r[0] || "").trim() === wanted);
    if (!row) {
      console.error("NOT FOUND:", wanted);
      continue;
    }
    if (seen.has(wanted)) continue;
    seen.add(wanted);
    out.push({ question: wanted, answer: cleanMultiline(row[1]) });
  }
  console.log(JSON.stringify(out, null, 2));
})();
