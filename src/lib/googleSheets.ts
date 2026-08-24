import { google } from 'googleapis';
import path from 'path';

export async function getSheetRows(range: string = 'Sales Dashboard!A1:Z1000') {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(process.cwd(), 'credentials/service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range,
  });

  return response.data.values ?? [];
}
