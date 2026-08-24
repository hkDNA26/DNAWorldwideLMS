const { google } = require("googleapis");
const path = require("path");

const CREDS = path.resolve(__dirname, "../credentials/service-account.json");
const SHEET_ID = "112SYnCNlWsAyzC0yxNHj-pLh-WdKJqyev-ZSxrPiDLg";

// Split a comma-separated string, but don't split inside parentheses (handles nested parens).
function splitTopLevel(str) {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (const ch of str) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts.map((s) => s.trim()).filter((s) => s.length > 0);
}

// Parse one group line, e.g. "Cocaine (Anhydroecgonine methylester (AEME / Crack), Benzoylecgonine (BZE), ...)"
// or the comma-only format "Cocaine Anhydroecgonine methylester, Benzoylecgonine, ..."
function parseGroupLine(line) {
  const parenIdx = line.indexOf("(");
  if (parenIdx !== -1) {
    let depth = 0;
    let closeIdx = -1;
    for (let i = parenIdx; i < line.length; i++) {
      if (line[i] === "(") depth++;
      if (line[i] === ")") {
        depth--;
        if (depth === 0) {
          closeIdx = i;
          break;
        }
      }
    }
    // Only treat this as "Label (drug, drug, ...)" wrapping the whole line if the
    // matching close-paren lands at (or almost at) the end of the line. Otherwise the
    // first "(" just belongs to an abbreviation mid-list, e.g. "Cannabidiol (CBD), Cannabinol (CBN)".
    if (closeIdx !== -1 && closeIdx >= line.length - 2) {
      const label = line.slice(0, parenIdx).trim();
      const inner = line.slice(parenIdx + 1, closeIdx);
      const drugs = splitTopLevel(inner);
      if (label && drugs.length > 0) {
        return { label, drugs };
      }
    }
  }
  const tokens = splitTopLevel(line);
  if (tokens.length > 1) {
    return { label: tokens[0], drugs: tokens.slice(1) };
  }
  if (tokens.length === 1) {
    return { label: null, drugs: tokens };
  }
  return null;
}

function parsePanel(name, raw, price) {
  const rawLower = raw.toLowerCase();
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  const header = lines.length > 0 ? lines[0].trim() : null;
  const groups = [];
  // When there's only one line total, it IS the content (no separate header line to strip).
  const startIdx = lines.length > 1 ? 1 : 0;
  const contentLines = lines.slice(startIdx).map((l) => l.trim());

  // Some panels (e.g. NPS/"Z Drugs" screens) are just flat catalogs of hundreds/thousands
  // of individual substance names, not "Label (drug, drug, ...)" groupings. Collapse those
  // into one flat group instead of one tiny group per line.
  if (contentLines.length > 50) {
    const drugs = contentLines.flatMap((l) => splitTopLevel(l));
    if (drugs.length > 0) groups.push({ label: null, drugs });
  } else {
    for (const line of contentLines) {
      const g = parseGroupLine(line);
      if (g) groups.push(g);
    }
  }
  return {
    name: name.trim(),
    price: parseFloat(price),
    isPerDrug: name.toLowerCase().includes("specific drug testing"),
    header,
    groups,
    rawLower,
  };
}

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Back End DOA Panels!A1:C40",
  });
  const rows = (res.data.values || []).filter((r) => r[0]);
  const panels = rows.map((r) => parsePanel(r[0], r[1] || "", r[2] || "0"));
  console.log(JSON.stringify(panels, null, 2));
})();
