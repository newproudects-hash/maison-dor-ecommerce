/*
 * ACTIVE SKILLS: public-apis-master (Telegram Bot API)
 */

export interface OrderData {
  orderNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  wilayaName: string;
  wilayaCode: number;
  deliveryType: 'home' | 'office';
  deliveryPrice: number;
  items: Array<{
    title: string;
    price: number;
    quantity: number;
    color?: string;
    size?: string;
  }>;
  subtotal: number;
  total: number;
}

export async function sendOrderToTelegram(order: OrderData): Promise<boolean> {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || BOT_TOKEN === 'PLACEHOLDER' || !CHAT_ID || CHAT_ID === 'PLACEHOLDER') {
    console.log('[Telegram] Token not configured yet — skipping');
    return false;
  }

  const deliveryLabel = order.deliveryType === 'home'
    ? '🏠 Livraison à domicile'
    : '🏢 Livraison au bureau (Point Relais)';

  const itemsList = order.items
    .map(item => {
      const details = [item.color, item.size].filter(Boolean).join(' | ');
      return `• ${item.title}${details ? ` (${details})` : ''} ×${item.quantity} — ${item.price.toLocaleString('fr-DZ')} DA`;
    })
    .join('\n');

  const message = `
🛍️ *طلب جديد — MAISON D'OR*
━━━━━━━━━━━━━━━━━━━━
📋 *رقم الطلب:* \`${order.orderNumber}\`
👤 *الاسم:* ${order.firstName} ${order.lastName}
📞 *الهاتف:* \`${order.phone}\`
📍 *الولاية:* ${order.wilayaName} (${order.wilayaCode})
${deliveryLabel}

📦 *المنتجات:*
${itemsList}

💰 *المجموع الفرعي:* ${order.subtotal.toLocaleString('fr-DZ')} DA
🚚 *التوصيل:* ${order.deliveryPrice.toLocaleString('fr-DZ')} DA
✅ *الإجمالي:* *${order.total.toLocaleString('fr-DZ')} DA*
━━━━━━━━━━━━━━━━━━━━
  `.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[Telegram] Failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Telegram] Network error:', error);
    return false;
  }
}

export async function sendSecurityAlertToTelegram(title: string, details: string, ip: string): Promise<boolean> {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || BOT_TOKEN === 'PLACEHOLDER' || !CHAT_ID || CHAT_ID === 'PLACEHOLDER') {
    console.log('[Security Alert] Token not configured yet — skipping');
    return false;
  }

  const message = `
🚨 *إنذار أمني — MAISON D'OR*
━━━━━━━━━━━━━━━━━━━━
⚠️ *الحدث:* ${title}
🌐 *IP:* \`${ip}\`
⏰ *الوقت:* ${new Date().toLocaleString('fr-DZ')}

📄 *التفاصيل:*
${details}
━━━━━━━━━━━━━━━━━━━━
  `.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('[Security Alert] Network error:', error);
    return false;
  }
}
