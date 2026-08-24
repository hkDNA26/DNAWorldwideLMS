const { google } = require("googleapis");
const path = require("path");

const CREDS = path.resolve(__dirname, "../credentials/service-account.json");
const SHEET_ID = "112SYnCNlWsAyzC0yxNHj-pLh-WdKJqyev-ZSxrPiDLg";

function clean(s) {
  return (s || "").replace(/[ \t]+/g, " ").trim();
}

// Collapse stray spaces per line but keep intentional line breaks (e.g. blood
// biomarker descriptions are "what it is" on line 1, detection window on line 2).
function cleanMultiline(s) {
  return (s || "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

// Both live in "Back End DOA Panels", below the main panel rows: URINE_PANELS around
// rows 40-45, BLOOD_PANELS around rows 59-64. Read a generous window and pick out
// whichever named rows fall in each block, deduping by name.
function extract(rows, names) {
  const out = [];
  const seen = new Set();
  for (const r of rows) {
    const name = clean(r[0]);
    if (names.includes(name) && !seen.has(name)) {
      seen.add(name);
      out.push({ name, desc: cleanMultiline(r[1]) });
    }
  }
  return out;
}

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Back End DOA Panels!A35:C70",
  });
  const rows = res.data.values || [];

  const urinePanels = extract(rows, [
    "(WP) Urine 6 Panel",
    "(WP) V1. Urine 10 Panel",
    "(WP) V2. Urine 10 Panel",
    "(WP) Urine 13 Panel",
    "(WP) Oral 6 Panel",
    "16 drug Unknown Substance",
  ]);
  const bloodPanels = extract(rows, ["Blood DOAs", "PEth", "CDT", "LFT", "FBC", "GGT-CDTr"]);

  console.log(JSON.stringify({ urinePanels, bloodPanels }, null, 2));
})();
