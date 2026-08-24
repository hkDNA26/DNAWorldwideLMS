const { google } = require("googleapis");
const path = require("path");

const CREDS = path.resolve(__dirname, "../credentials/service-account.json");
const SHEET_ID = "112SYnCNlWsAyzC0yxNHj-pLh-WdKJqyev-ZSxrPiDLg";

function clean(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Back end Medications!A1:C1041",
  });
  const rows = (res.data.values || []).filter((r) => r[0] || r[1] || r[2]);
  const meds = rows
    .map((r) => ({
      group: clean(r[0]) || null,
      ingredient: clean(r[1]) || null,
      brand: clean(r[2]),
    }))
    // A brand-name search can never surface a row with no brand name.
    .filter((m) => m.brand);
  console.log(JSON.stringify(meds, null, 2));
})();
