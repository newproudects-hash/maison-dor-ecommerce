import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Telegram config
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Google Sheets config (Official API)
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderNumber, firstName, lastName, phone, 
      wilayaName, wilayaCode, deliveryType, deliveryPrice, 
      address, items, subtotal, total
    } = body;

    const itemsSummary = items.map((i: any) => 
      `${i.quantity}x ${i.productName} ${i.size ? `(Taille: ${i.size})` : ''} ${i.color ? `(Couleur: ${i.color})` : ''}`
    ).join('\n');

    // 1. Save to Supabase
    if (supabase) {
      await supabase.from('orders').insert([{
        order_number: orderNumber,
        customer_name: `${firstName} ${lastName}`,
        phone: phone,
        wilaya: wilayaName,
        delivery_type: deliveryType,
        delivery_price: deliveryPrice,
        address: address || null,
        items: items,
        subtotal: subtotal,
        total: total,
        status: 'pending'
      }]);
    }

    // 2. Send to Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const message = `
🛍️ *NOUVELLE COMMANDE: ${orderNumber}* 🛍️

👤 *Client:* ${firstName} ${lastName}
📞 *Téléphone:* ${phone}
📍 *Wilaya:* ${wilayaCode} - ${wilayaName}
🚚 *Livraison:* ${deliveryType === 'home' ? 'À domicile' : 'Bureau'}
🏠 *Adresse:* ${address || 'N/A'}

📦 *Articles:*
${itemsSummary}

💰 *Sous-total:* ${subtotal} DA
🚚 *Livraison:* ${deliveryPrice} DA
💳 *TOTAL:* ${total} DA
      `;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      }).catch(e => console.error("Telegram error:", e));
    }

    // 3. Send to Google Sheets (Official API)
    if (GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY && GOOGLE_SHEET_ID) {
      try {
        const jwt = new JWT({
          email: GOOGLE_CLIENT_EMAIL,
          key: GOOGLE_PRIVATE_KEY,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        
        const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        // Insert a row for each item in the order to separate them
        for (const item of items) {
          await sheet.addRow({
            'رقم الطلب': orderNumber,
            'التاريخ': new Date().toISOString(),
            'العميل': `${firstName} ${lastName}`,
            'الهاتف': phone,
            'الولاية': wilayaName,
            'التوصيل': deliveryType === 'home' ? 'منزل' : 'مكتب',
            'العنوان': address || '-',
            'اسم المنتج': item.productName,
            'الكمية': item.quantity,
            'المقاس': item.size || '-',
            'اللون': item.color || '-',
            'إجمالي الطلب': total,
            'الحالة': 'قيد الانتظار'
          });
        }
      } catch (sheetError) {
        console.error("Google Sheets API error:", sheetError);
      }
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (error: any) {
    console.error('Order processing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
