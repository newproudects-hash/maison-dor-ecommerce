import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

const STATUS_OPTIONS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغية',
};

export async function PATCH(req: Request) {
  try {
    const { orderNumber, status } = await req.json();

    if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
      return NextResponse.json({ success: false, error: 'Google Sheets not configured' }, { status: 500 });
    }

    const statusAr = STATUS_OPTIONS[status] || status;

    const jwt = new JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    let updated = 0;
    for (const row of rows) {
      if (row.get('رقم الطلب') === orderNumber) {
        row.set('الحالة', statusAr);
        await row.save();
        updated++;
      }
    }

    return NextResponse.json({ success: true, updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update status error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
