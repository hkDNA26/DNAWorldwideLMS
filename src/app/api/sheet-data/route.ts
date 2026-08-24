import { NextResponse } from 'next/server';
import { getSheetRows } from '@/lib/googleSheets';

export async function GET() {
  try {
    const rows = await getSheetRows();
    return NextResponse.json({ rows });
  } catch (error) {
    console.error('Failed to fetch sheet data:', error);
    return NextResponse.json({ error: 'Failed to fetch sheet data' }, { status: 500 });
  }
}
