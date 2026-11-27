/**
 * ZukkoMarket - Professional Telegram Bot Server
 * Bot: @Hsjxbskbxsj_bot
 * Imkoniyatlar:
 *  - Do'kon Mini App (WebApp) integratsiyasi
 *  - Katalog bo'yicha mahsulotlarni ko'rish va qidirish
 *  - AI Oshpaz / Shopping Assistent (Osh, Somsa, Nonushta, Fitness retseptlari)
 *  - Jonli buyurtma holatini boshqarish (Qabul qilish, Kuryer, Yetkazildi)
 *  - Keshbek hamyoni va Promokodlar
 *  - Admin statistika paneli
 *  - Local API Server (Port 5174) orqali saytdan buyurtmalarni avtomatik qabul qilish
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Token & Config
let RAW_TOKEN = process.env.BOT_TOKEN || '9100549839:AAEeiATZUeYGhoXAbcrOJysDZT2EV5TVT4o';
let BOT_TOKEN = RAW_TOKEN.trim();
let ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '';
let WEB_APP_URL = process.env.WEB_APP_URL || 'http://localhost:5173';
let lastUpdateId = 0;

// Faol chatlar va kutilayotgan buyurtmalar
const CHATS_FILE = path.join(__dirname, 'telegram_chats.json');
let ACTIVE_CHATS = new Set();
let PENDING_ORDERS = [];

try {
  if (fs.existsSync(CHATS_FILE)) {
    const raw = fs.readFileSync(CHATS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      parsed.forEach(id => ACTIVE_CHATS.add(String(id)));
    }
  }
} catch (e) {}

function saveActiveChats() {
  try {
    fs.writeFileSync(CHATS_FILE, JSON.stringify(Array.from(ACTIVE_CHATS), null, 2), 'utf8');
  } catch (e) {}
}

// Mahsulotlar bazasi (Catalog)
const PRODUCTS = [
  { id: 'prod-1', name: 'Qizil Olma (Oltin vodiy)', category: 'mevalar', price: 18000, unit: '1 kg', stock: 45, badge: 'Chegirma' },
  { id: 'prod-2', name: 'Sara Pomidor (Yusupov)', category: 'mevalar', price: 22000, unit: '1 kg', stock: 30, badge: 'Organik' },
  { id: 'prod-3', name: 'Sariq Banan (Ekvador)', category: 'mevalar', price: 25000, unit: '1 kg', stock: 50, badge: 'Xit' },
  { id: 'prod-4', name: 'Yangi Bodring', category: 'mevalar', price: 15000, unit: '1 kg', stock: 40, badge: 'Yangi' },
  { id: 'prod-5', name: 'Oshlik Sabzi (Sariq va Qizil)', category: 'mevalar', price: 7000, unit: '1 kg', stock: 85, badge: 'Osh uchun' },
  { id: 'prod-6', name: 'Musaffo Sut 3.2%', category: 'sut', price: 14000, unit: '1 L', stock: 60, badge: 'Sifatli' },
  { id: 'prod-7', name: 'Qaymoq (Chimboy)', category: 'sut', price: 28000, unit: '400 g', stock: 25, badge: 'Tabiiy' },
  { id: 'prod-8', name: 'Tuxum D-1 (Oltin tovuq)', category: 'sut', price: 24000, unit: '15 dona', stock: 80, badge: 'Yangi' },
  { id: 'prod-9', name: 'Mol go\'shti (Lahm, Yangi)', category: 'gosht', price: 105000, unit: '1 kg', stock: 20, badge: 'Halol' },
  { id: 'prod-10', name: 'Qo\'y go\'shti (Qovurma qovurg\'a)', category: 'gosht', price: 115000, unit: '1 kg', stock: 15, badge: 'Premium' },
  { id: 'prod-11', name: 'Parranda go\'shti (Tovuq filesi)', category: 'gosht', price: 48000, unit: '1 kg', stock: 35, badge: 'Dietik' },
  { id: 'prod-12', name: 'Tandir Samarqand Noni', category: 'non', price: 8000, unit: '1 dona', stock: 50, badge: 'Issiq' },
  { id: 'prod-13', name: 'Lazer Guruch (Oshbop)', category: 'baqqollik', price: 32000, unit: '1 kg', stock: 70, badge: 'Osh uchun' },
  { id: 'prod-14', name: 'Omuxta Pista Yog\'i (Zolotaya Semechka)', category: 'baqqollik', price: 21000, unit: '1 L', stock: 90, badge: 'Tozalangan' },
  { id: 'prod-15', name: 'Coca-Cola Classic', category: 'ichimliklar', price: 14000, unit: '1.5 L', stock: 120, badge: 'Muzdek' },
  { id: 'prod-16', name: 'Akbar Choy (Qora, Premium)', category: 'ichimliklar', price: 29000, unit: '250 g', stock: 45, badge: 'Xushbo\'y' }
];

// AI Retseptlar to'plami
const RECIPES = {
  palov: {
    title: '🍲 Haqiqiy Toshkent To\'y Oshi',
    items: [
      { name: 'Mol go\'shti (Lahm)', amount: '1 kg', price: 105000 },
      { name: 'Lazer Guruch (Oshbop)', amount: '1 kg', price: 32000 },
      { name: 'Oshlik Sabzi (Sariq)', amount: '1 kg', price: 7000 },
      { name: 'Pista Yog\'i', amount: '1 L', price: 21000 }
    ],
    tips: 'Guruchni iliq tuzli suvda kamida 40 daqiqa ivitib oling. Zirak va no\'xat solishni unutmang!',
    total: 165000
  },
  somsa: {
    title: '🥟 Qarsildoq Tandir Somsa',
    items: [
      { name: 'Mol go\'shti (Lahm)', amount: '500 g', price: 52500 },
      { name: 'Piyoz va Zira', amount: '1 kg', price: 5000 },
      { name: 'Oliy navli Un', amount: '1 kg', price: 12000 },
      { name: 'Chimboy Qaymoq', amount: '400 g', price: 28000 }
    ],
    tips: 'Xamirini qattiqroq qilib, yaxshilab tindiring. Go\'shtni mayda to\'rtburchak qilib to\'g\'rang.',
    total: 97500
  },
  omlet: {
    title: '🍳 Quvvatli Nonushta (Klassik Omlet & Choy)',
    items: [
      { name: 'Tuxum D-1', amount: '15 dona', price: 24000 },
      { name: 'Musaffo Sut 3.2%', amount: '1 L', price: 14000 },
      { name: 'Tandir Noni', amount: '1 dona', price: 8000 },
      { name: 'Akbar Choy', amount: '250 g', price: 29000 }
    ],
    tips: 'Tuxum va sutni 1:1 nisbatda aralashtirib, o\'rta olovda 7 daqiqa dimlab pishiring.',
    total: 75000
  },
  fitness: {
    title: '🥗 Fitness & Parhez To\'plami',
    items: [
      { name: 'Tovuq filesi', amount: '1 kg', price: 48000 },
      { name: 'Sara Pomidor', amount: '1 kg', price: 22000 },
      { name: 'Yangi Bodring', amount: '1 kg', price: 15000 },
      { name: 'Qizil Olma', amount: '1 kg', price: 18000 }
    ],
    tips: 'Tovuq filesini qovurmasdan qaynatib yoki duxovkada pishiring. Kam yog\'li salat bilan iste\'mol qiling.',
    total: 103000
  }
};

console.log('========================================================');
console.log('🤖 ZukkoMarket Professional Telegram Bot Serveri');
console.log(`📌 Token: ${BOT_TOKEN.slice(0, 15)}...`);
console.log(`🌐 WebApp URL: ${WEB_APP_URL}`);
console.log('========================================================\n');

// Telegram API Helper
function callTelegramApi(method, data = {}, token = BOT_TOKEN) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ ok: false, error: e.message });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function sendMessage(chatId, text, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }
  return callTelegramApi('sendMessage', payload);
}

async function editMessageText(chatId, messageId, text, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }
  return callTelegramApi('editMessageText', payload);
}

// Asosiy klaviatura
function getMainKeyboard() {
  return {
    keyboard: [
      [{ text: '🛍 Do\'konni ochish', web_app: { url: WEB_APP_URL } }],
      [{ text: '🍎 Mahsulotlar katalogi' }, { text: '🔍 Mahsulot qidirish' }],
      [{ text: '🤖 AI Oshpaz & Retseptlar' }, { text: '📦 Buyurtmalarim' }],
      [{ text: '🎁 Keshbek hamyon' }, { text: '🎟 Promokodlar' }],
      [{ text: '📞 Aloqa va Manzil' }, { text: '👑 Admin Statistika' }]
    ],
    resize_keyboard: true,
    is_persistent: true
  };
}

// Format Order Message
function formatOrderMessage(order) {
  const itemsText = (order.items || []).map((it, idx) =>
    `  ${idx + 1}. <b>${it.name}</b> × ${it.quantity} ${it.unit || 'dona'} — <code>${Number(it.total || 0).toLocaleString()} so'm</code>`
  ).join('\n');

  const encodedAddress = encodeURIComponent(order.address || 'Toshkent');
  const cleanPhone = (order.phone || '').replace(/[^0-9+]/g, '');

  const text = `🛍 <b>YANGI BUYURTMA #${order.orderNumber}</b>\n` +
    `📅 <i>Sana: ${order.date || new Date().toLocaleString('uz-UZ')}</i>\n` +
    `━━━━━━━━━━━━━━━━━━━\n\n` +
    `👤 <b>Mijoz:</b> ${order.customerName || 'Xaridor'}\n` +
    `📞 <b>Telefon:</b> <a href="tel:${cleanPhone}">${order.phone || 'Kiritilmagan'}</a>\n` +
    `📍 <b>Manzil:</b> ${order.address || 'Kiritilmagan'}\n` +
    `⏰ <b>Yetkazish vaqti:</b> ${order.deliveryTime || 'Tezkor (30-45 daqiqa)'}\n` +
    `💳 <b>To'lov usuli:</b> ${(order.paymentMethod || 'click').toUpperCase()}\n` +
    `🛵 <b>Holati:</b> 🟡 Kutilmoqda\n\n` +
    `📦 <b>Buyurtma tarkibi (${(order.items || []).length} xil):</b>\n${itemsText}\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `💵 <b>Oraliq summa:</b> ${Number(order.subtotal || 0).toLocaleString()} so'm\n` +
    (order.discount ? `🎟 <b>Chegirma:</b> -${Number(order.discount).toLocaleString()} so'm\n` : '') +
    (order.usedCashback ? `🎁 <b>Keshbek:</b> -${Number(order.usedCashback).toLocaleString()} so'm\n` : '') +
    `🛵 <b>Yetkazib berish:</b> ${order.deliveryFee ? Number(order.deliveryFee).toLocaleString() + " so'm" : 'Bepul'}\n` +
    `💰 <b>JAMI TO'LOV:</b> <b>${Number(order.total || 0).toLocaleString()} so'm</b>\n` +
    (order.notes ? `\n📝 <b>Izoh:</b> <i>"${order.notes}"</i>\n` : '') +
    `\n✨ <i>ZukkoMarket AI Savdo Tizimi</i>`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📞 Qo\'ng\'iroq qilish', url: `https://t.me/share/url?url=${encodeURIComponent(`tel:${cleanPhone}`)}` },
        { text: '📍 Xaritada ko\'rish', url: `https://yandex.uz/maps/?text=${encodedAddress}` }
      ],
      [
        { text: '👨‍🍳 Qabul qilish', callback_data: `status_prep_${order.id || order.orderNumber}` },
        { text: '🛵 Kuryer yo\'lda', callback_data: `status_courier_${order.id || order.orderNumber}` }
      ],
      [
        { text: '✅ Yetkazildi', callback_data: `status_done_${order.id || order.orderNumber}` },
        { text: '❌ Bekor qilish', callback_data: `status_cancel_${order.id || order.orderNumber}` }
      ]
    ]
  };

  return { text, keyboard };
}

// Broadcast Order to all connected Telegram chats
async function broadcastOrder(order) {
  const { text, keyboard } = formatOrderMessage(order);
  const targets = new Set(ACTIVE_CHATS);
  if (ADMIN_CHAT_ID) targets.add(ADMIN_CHAT_ID);

  if (targets.size === 0) {
    console.log('⚠️ Hech qanday faol Telegram chat topilmadi. Buyurtma navbatga qo\'yildi.');
    PENDING_ORDERS.push(order);
    return { ok: false, queued: true, message: 'Chat ID hali ulanmagan' };
  }

  let sentCount = 0;
  for (const chatId of targets) {
    try {
      const res = await sendMessage(chatId, text, keyboard);
      if (res.ok) {
        sentCount++;
        console.log(`✅ Buyurtma #${order.orderNumber} ${chatId} ga muvaffaqiyatli yetkazildi!`);
      } else {
        console.warn(`Telegram yuborishda ogohlantirish (${chatId}):`, res.description);
      }
    } catch (e) {
      console.error(`Telegram yuborishda xatolik (${chatId}):`, e.message);
    }
  }

  return { ok: sentCount > 0, sentCount };
}

// Local HTTP Server on Port 5174 for instantaneous WebApp communication
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      bot: '@Hsjxbskbxsj_bot',
      adminChatId: ADMIN_CHAT_ID || (ACTIVE_CHATS.size > 0 ? Array.from(ACTIVE_CHATS)[0] : null),
      activeChats: Array.from(ACTIVE_CHATS),
      pendingCount: PENDING_ORDERS.length
    }));
    return;
  }

  if (req.url === '/api/set-chat-id' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { chatId } = JSON.parse(body);
        if (chatId) {
          ACTIVE_CHATS.add(String(chatId));
          ADMIN_CHAT_ID = String(chatId);
          saveActiveChats();
          console.log(`✅ Chat ID qabul qilindi: ${chatId}`);

          // Flush pending orders
          if (PENDING_ORDERS.length > 0) {
            console.log(`📦 ${PENDING_ORDERS.length} ta kutilayotgan buyurtma ${chatId} ga yuborilmoqda...`);
            const toSend = [...PENDING_ORDERS];
            PENDING_ORDERS = [];
            for (const ord of toSend) {
              await broadcastOrder(ord);
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, chatId }));
          return;
        }
      } catch (err) {}
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false }));
    });
    return;
  }

  if (req.url === '/api/order' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const order = JSON.parse(body);
        const result = await broadcastOrder(order);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(5174, () => {
  console.log('📡 Mahalliy buyurtma qabul qilish API serveri 5174-portda ONLINE');
});

// Botni tekshirish va ishga tushirish
async function initBot() {
  try {
    const me = await callTelegramApi('getMe', {}, BOT_TOKEN);

    if (me.ok) {
      console.log(`✅ Telegram bot muvaffaqiyatli ulandi!`);
      console.log(`👤 Bot nomi: @${me.result.username} (${me.result.first_name})`);
      console.log(`🌐 Bot holati: ONLINE va xabarlarni tinglamoqda...\n`);

      // WebApp menyu tugmasini o'rnatish
      try {
        await callTelegramApi('setChatMenuButton', {
          menu_button: {
            type: 'web_app',
            text: '🛍 Do\'kon',
            web_app: { url: WEB_APP_URL }
          }
        });
      } catch (e) {}

      pollUpdates();
    } else {
      console.log(`⚠️ Telegram bot xatosi: ${me.description}`);
      setTimeout(initBot, 10000);
    }
  } catch (err) {
    console.error('Ulanish xatosi:', err.message);
    setTimeout(initBot, 10000);
  }
}

// Long-polling
async function pollUpdates() {
  try {
    const updates = await callTelegramApi('getUpdates', {
      offset: lastUpdateId + 1,
      timeout: 25
    });

    if (updates.ok && updates.result) {
      for (const update of updates.result) {
        lastUpdateId = update.update_id;
        handleUpdate(update);
      }
    } else if (!updates.ok) {
      if (updates.error_code === 409) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  } catch (err) {
    // Retry on error
  }
  setTimeout(pollUpdates, 1200);
}

// Xabarlar va tugmalarni qayta ishlash
async function handleUpdate(update) {
  // 1. INLINE TUGMA BOSILGANDA (Callback Query)
  if (update.callback_query) {
    const cb = update.callback_query;
    const data = cb.data;
    const chatId = cb.message.chat.id;
    const msgId = cb.message.message_id;
    const adminName = cb.from.first_name || 'Admin';
    const currentTime = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    ACTIVE_CHATS.add(String(chatId));
    saveActiveChats();

    // Status updates
    if (data.startsWith('status_prep_')) {
      const orderId = data.replace('status_prep_', '');
      await callTelegramApi('answerCallbackQuery', {
        callback_query_id: cb.id,
        text: '👨‍🍳 Buyurtma qabul qilindi va oshxonada yig\'ilmoqda!'
      });
      await sendMessage(chatId, `👨‍🍳 <b>Buyurtma holati yangilandi:</b>\nBuyurtma #${orderId} qabul qilindi (${adminName} tomonidan, soat ${currentTime}).`);
    } else if (data.startsWith('status_courier_')) {
      const orderId = data.replace('status_courier_', '');
      await callTelegramApi('answerCallbackQuery', {
        callback_query_id: cb.id,
        text: '🛵 Buyurtma kuryerga topshirildi!'
      });
      await sendMessage(chatId, `🛵 <b>Buyurtma holati yangilandi:</b>\nBuyurtma #${orderId} kuryerga berildi va yo'lga chiqdi!`);
    } else if (data.startsWith('status_done_')) {
      const orderId = data.replace('status_done_', '');
      await callTelegramApi('answerCallbackQuery', {
        callback_query_id: cb.id,
        text: '✅ Buyurtma muvaffaqiyatli yetkazildi!'
      });
      await sendMessage(chatId, `✅ <b>Buyurtma muvaffaqiyatli yetkazildi!</b>\nMijozga xarid uchun minnatdorchilik bildiramiz.`);
    } else if (data.startsWith('status_cancel_')) {
      const orderId = data.replace('status_cancel_', '');
      await callTelegramApi('answerCallbackQuery', {
        callback_query_id: cb.id,
        text: '❌ Buyurtma bekor qilindi!'
      });
      await sendMessage(chatId, `❌ <b>Buyurtma bekor qilindi:</b> #${orderId} (${adminName} tomonidan)`);
    }

    // Kategoriya tanlanganda
    else if (data.startsWith('cat_')) {
      const catKey = data.replace('cat_', '');
      const filtered = PRODUCTS.filter(p => p.category === catKey);

      let text = `📂 <b>${catKey.toUpperCase()} bo'limidagi mahsulotlar:</b>\n\n`;
      filtered.forEach((p, i) => {
        text += `${i + 1}. <b>${p.name}</b>\n` +
          `   💰 Narxi: <code>${p.price.toLocaleString()} so'm</code> / ${p.unit}\n` +
          `   📦 Ombor qoldig'i: ${p.stock} dona | ✨ ${p.badge}\n\n`;
      });
      text += `🛒 <i>Xarid qilish uchun quyidagi tugmani bosing:</i>`;

      const inlineKeyboard = {
        inline_keyboard: [
          [{ text: '🛍 Savatga qo\'shish (Mini App)', web_app: { url: WEB_APP_URL } }],
          [{ text: '◀️ Orqaga (Katalog)', callback_data: 'show_catalog' }]
        ]
      };

      await callTelegramApi('answerCallbackQuery', { callback_query_id: cb.id });
      await editMessageText(chatId, msgId, text, inlineKeyboard);
    }

    // Katalogga qaytish
    else if (data === 'show_catalog') {
      await callTelegramApi('answerCallbackQuery', { callback_query_id: cb.id });
      const catKeyboard = {
        inline_keyboard: [
          [
            { text: '🍏 Mevalar & Sabzavotlar', callback_data: 'cat_mevalar' },
            { text: '🥛 Sut mahsulotlari', callback_data: 'cat_sut' }
          ],
          [
            { text: '🥩 Go\'sht & Parranda', callback_data: 'cat_gosht' },
            { text: '🍞 Non & Qandolat', callback_data: 'cat_non' }
          ],
          [
            { text: '🌾 Baqqollik (Donlar)', callback_data: 'cat_baqqollik' },
            { text: '🥤 Ichimliklar', callback_data: 'cat_ichimliklar' }
          ],
          [
            { text: '🛍 Barcha mahsulotlar (Do\'konda)', web_app: { url: WEB_APP_URL } }
          ]
        ]
      };
      await editMessageText(chatId, msgId, '🛒 <b>Qaysi bo\'lim mahsulotlarini ko\'rmoqchisiz?</b>\nQuyidagi toifalardan birini tanlang:', catKeyboard);
    }

    // AI Retsept tanlanganda
    else if (data.startsWith('ai_recipe_')) {
      const recipeKey = data.replace('ai_recipe_', '');
      const recipe = RECIPES[recipeKey];
      if (recipe) {
        let msg = `${recipe.title}\n━━━━━━━━━━━━━━━━━━━\n\n` +
          `📋 <b>Kerakli masalliqlar va narxlari:</b>\n`;

        recipe.items.forEach((item, idx) => {
          msg += `  ${idx + 1}. <b>${item.name}</b> (${item.amount}) — <code>${item.price.toLocaleString()} so'm</code>\n`;
        });

        msg += `\n💰 <b>Jami savat summasi:</b> <b>${recipe.total.toLocaleString()} so'm</b>\n` +
          `💡 <b>Oshpaz maslahati:</b> <i>${recipe.tips}</i>\n\n` +
          `Barcha masalliqlarni 1 ta tugma orqali buyurtma qiling:`;

        const keyboard = {
          inline_keyboard: [
            [{ text: '🛒 Ushbu to\'plamni sotib olish', web_app: { url: WEB_APP_URL } }],
            [{ text: '◀️ Boshqa retseptlar', callback_data: 'show_ai_menu' }]
          ]
        };

        await callTelegramApi('answerCallbackQuery', { callback_query_id: cb.id });
        await editMessageText(chatId, msgId, msg, keyboard);
      }
    }

    // AI Menyuga qaytish
    else if (data === 'show_ai_menu') {
      await callTelegramApi('answerCallbackQuery', { callback_query_id: cb.id });
      const aiKeyboard = {
        inline_keyboard: [
          [{ text: '🍲 Haqiqiy Osh (Palov)', callback_data: 'ai_recipe_palov' }],
          [{ text: '🥟 Tandir Somsa', callback_data: 'ai_recipe_somsa' }],
          [{ text: '🍳 Quvvatli Nonushta (Omlet)', callback_data: 'ai_recipe_omlet' }],
          [{ text: '🥗 Fitness & Parhez salati', callback_data: 'ai_recipe_fitness' }]
        ]
      };
      await editMessageText(chatId, msgId, '🤖 <b>Zukko AI Oshpaz:</b> Qaysi taom uchun masalliqlar savatchasini tayyorlab beraylik?', aiKeyboard);
    }

    return;
  }

  // 2. MATNLI XABARLAR (Text Messages)
  if (!update.message || !update.message.text) return;

  const msg = update.message;
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const userName = msg.from.first_name || 'Xaridor';

  console.log(`[Xabar] ${userName} (${chatId}): ${text}`);

  // Yangi chat ID ni ro'yxatga qo'shish
  ACTIVE_CHATS.add(String(chatId));
  saveActiveChats();

  if (!ADMIN_CHAT_ID) {
    ADMIN_CHAT_ID = String(chatId);
  }

  // Agar navbatda kutilayotgan buyurtmalar bo'lsa, ularni darhol foydalanuvchiga yuborish!
  if (PENDING_ORDERS.length > 0) {
    console.log(`📦 ${PENDING_ORDERS.length} ta kutilayotgan buyurtma ${chatId} ga yuborilmoqda...`);
    const ordersToSend = [...PENDING_ORDERS];
    PENDING_ORDERS = [];
    for (const ord of ordersToSend) {
      await broadcastOrder(ord);
    }
  }

  // --- /start ---
  if (text.startsWith('/start')) {
    const welcomeText = `Assalomu alaykum, <b>${userName}</b>! 👋\n\n` +
      `🛒 <b>ZukkoMarket</b> — zamonaviy oziq-ovqat va sun'iy intellektli shopping platformasining rasmiy botiga xush kelibsiz!\n\n` +
      `✅ <b>Sizning Telegram hisobingiz do'kon tizimiga muvaffaqiyatli ulandi!</b>\n` +
      `Endi veb-saytda berilgan har bir yangi buyurtma avtomatik ravishda shu yerga keladi.\n\n` +
      `✨ <b>Bizning imkoniyatlarimiz:</b>\n` +
      `• ⚡️ <b>30 daqiqada yetkazib berish:</b> Tezkor kuryerlik xizmati;\n` +
      `• 🤖 <b>AI Oshpaz:</b> Retseptlar bo'yicha tayyor savat yig'ish;\n` +
      `• 🎁 <b>Keshbek:</b> Har bir xariddan 2% bonus hisobingizga tushadi;\n` +
      `• 📱 <b>Telegram Mini App:</b> Ilovani to'g'ridan-to'g'ri Telegramda ochish;\n` +
      `• 💳 <b>To'lov:</b> Click, Payme, Uzum va Naqd pul.\n\n` +
      `Xarid qilish uchun quyidagi tugmalardan birini tanlang:`;

    await sendMessage(chatId, welcomeText, getMainKeyboard());
    return;
  }

  // --- Katalog ---
  if (text === '🍎 Mahsulotlar katalogi' || text.startsWith('/catalog')) {
    const catKeyboard = {
      inline_keyboard: [
        [
          { text: '🍏 Mevalar & Sabzavotlar', callback_data: 'cat_mevalar' },
          { text: '🥛 Sut mahsulotlari', callback_data: 'cat_sut' }
        ],
        [
          { text: '🥩 Go\'sht & Parranda', callback_data: 'cat_gosht' },
          { text: '🍞 Non & Qandolat', callback_data: 'cat_non' }
        ],
        [
          { text: '🌾 Baqqollik (Donlar)', callback_data: 'cat_baqqollik' },
          { text: '🥤 Ichimliklar', callback_data: 'cat_ichimliklar' }
        ],
        [
          { text: '🛍 Barcha 24+ mahsulotlar (Do\'konda)', web_app: { url: WEB_APP_URL } }
        ]
      ]
    };

    await sendMessage(chatId,
      `🛒 <b>ZukkoMarket Mahsulotlar Katalogi:</b>\n\n` +
      `Bizda barcha oziq-ovqat mahsulotlari 100% yangi va Halol standartlariga javob beradi.\n` +
      `Kerakli bo'limni tanlang:`,
      catKeyboard
    );
    return;
  }

  // --- Mahsulot qidirish ---
  if (text === '🔍 Mahsulot qidirish') {
    await sendMessage(chatId,
      `🔍 <b>Mahsulot qidirish:</b>\n\n` +
      `Istalgan mahsulot nomini yozib yuboring (Masalan: <i>olma, go'sht, sut, pomidor, non, cola</i>):`
    );
    return;
  }

  // --- AI Oshpaz ---
  if (text === '🤖 AI Oshpaz & Retseptlar' || text.startsWith('/ai')) {
    const aiKeyboard = {
      inline_keyboard: [
        [{ text: '🍲 Haqiqiy Osh (Palov)', callback_data: 'ai_recipe_palov' }],
        [{ text: '🥟 Tandir Somsa', callback_data: 'ai_recipe_somsa' }],
        [{ text: '🍳 Quvvatli Nonushta (Omlet)', callback_data: 'ai_recipe_omlet' }],
        [{ text: '🥗 Fitness & Parhez salati', callback_data: 'ai_recipe_fitness' }]
      ]
    };

    await sendMessage(chatId,
      `🤖 <b>Zukko AI Oshpaz va Shopping Maslahatchisi:</b>\n\n` +
      `Nima pishirishni bilmayapsizmi? Retseptni tanlang — AI tizimimiz barcha kerakli masalliqlarni sanab, narxini hisoblab savatchangizga tayyorlab beradi!\n\n` +
      `Qaysi taomni tayyorlaymiz?`,
      aiKeyboard
    );
    return;
  }

  // --- Buyurtmalarim ---
  if (text === '📦 Buyurtmalarim' || text.startsWith('/orders') || text.startsWith('/track')) {
    const ordersText = `📦 <b>Sizning buyurtmalaringiz:</b>\n\n` +
      `🛍 <b>Buyurtma: #ZM-849201</b>\n` +
      `📅 Sana: 27-Noyabr, 2026\n` +
      `💰 Summa: <b>185 000 so'm</b>\n` +
      `🛵 Holati: <b>Kuryer yo'lda (Yetib kelish: ~15 daqiqa)</b>\n` +
      `👤 Kuryer: Sanjarbek Alimov (+998 97 765 43 21)\n` +
      `🛵 Transport: Honda Lead (01 777 ZM)\n\n` +
      `📍 <i>Saytda jonli interaktiv xarita orqali kuryerni kuzatishingiz mumkin!</i>`;

    const trackKeyboard = {
      inline_keyboard: [
        [{ text: '🗺 Jonli xaritada kuzatish', web_app: { url: WEB_APP_URL } }]
      ]
    };

    await sendMessage(chatId, ordersText, trackKeyboard);
    return;
  }

  // --- Keshbek Hamyon ---
  if (text === '🎁 Keshbek hamyon' || text.startsWith('/wallet')) {
    const walletText = `🎁 <b>Sizning Zukko Keshbek Hamyoningiz:</b>\n\n` +
      `💰 Joriy balansingiz: <b>25 000 so'm</b>\n` +
      `💎 <b>Keshbek qoidalari:</b>\n` +
      `• Har bir muvaffaqiyatli xaridingizdan <b>2%</b> keshbek hisobingizga qaytadi;\n` +
      `• Keshbek pullaringiz bilan keyingi buyurtmalarni to'liq yoki qisman to'lashingiz mumkin;\n` +
      `• Do'stlaringizni taklif qilib qo'shimcha 10 000 so'm bonus oling!`;

    await sendMessage(chatId, walletText);
    return;
  }

  // --- Promokodlar ---
  if (text === '🎟 Promokodlar' || text.startsWith('/promo')) {
    const promoText = `🎟 <b>Ayni paytda faol chegirma promokodlari:</b>\n\n` +
      `1. <code>ZUKKO10</code> — Barcha buyurtmalarga <b>10% chegirma</b> (Minimal xarid: 100 000 so'm)\n` +
      `2. <code>YANGI2026</code> — Birinchi xarid uchun <b>15% chegirma</b> (Minimal xarid: 150 000 so'm)\n` +
      `3. <code>BEPUL</code> — Shahar bo'ylab <b>mutlaqo bepul yetkazib berish</b>\n\n` +
      `💡 <i>Buyurtma rasmiylashtirishda ushbu kodlardan birini kiriting!</i>`;

    await sendMessage(chatId, promoText);
    return;
  }

  // --- Aloqa va Manzil ---
  if (text === '📞 Aloqa va Manzil' || text.startsWith('/contact')) {
    const contactText = `📞 <b>ZukkoMarket Mijozlarni Qo'llab-quvvatlash Markazi:</b>\n\n` +
      `☎️ Yagona Call-markaz: <b>+998 71 200 00 26</b>\n` +
      `📱 Telegram Support: @zukko_support\n` +
      `📧 E-mail: support@zukkomarket.uz\n` +
      `📍 Bosh ombor: Toshkent sh., Chilonzor tumani, Bunyodkor shox ko'chasi 42-uy\n` +
      `⏰ Ish tartibi: <b>24 soat / 7 kun</b> (Tanaffus va dam olishsiz)`;

    await sendMessage(chatId, contactText);
    return;
  }

  // --- Admin Statistika ---
  if (text === '👑 Admin Statistika' || text.startsWith('/admin') || text.startsWith('/stats')) {
    const statsText = `👑 <b>ZukkoMarket Do'kon Statistikasi (Bugungi):</b>\n\n` +
      `📦 Bugungi buyurtmalar: <b>18 ta</b>\n` +
      `💰 Jami tushum: <b>3 420 000 so'm</b>\n` +
      `🛵 Yetkazilgan: <b>15 ta</b> | Yo'lda: <b>3 ta</b>\n` +
      `👥 Ro'yxatdan o'tgan mijozlar: <b>142 nafar</b>\n` +
      `⚠️ Kam qolgan tovarlar: <i>Qo'y go'shti (15 kg), Qaymoq (25 dona)</i>\n\n` +
      `⚙️ To'liq boshqaruv uchun veb-saytdagi <b>Admin Panel</b>ga kiring.`;

    await sendMessage(chatId, statsText);
    return;
  }

  // --- Yordam ---
  if (text.startsWith('/help')) {
    const helpText = `ℹ️ <b>Mavjud buyruqlar ro'yxati:</b>\n\n` +
      `/start — Botni ishga tushirish va asosiy menyu\n` +
      `/catalog — Mahsulotlar toifalarini ko'rish\n` +
      `/ai — AI Oshpaz orqali tayyor savat to'plash\n` +
      `/orders — Buyurtmalarni tekshirish va kuzatish\n` +
      `/wallet — Keshbek hamyoni balansi\n` +
      `/promo — Faol chegirma kodlari\n` +
      `/admin — Do'kon statistikasi va hisobotlar\n` +
      `/contact — Aloqa ma'lumotlari`;

    await sendMessage(chatId, helpText);
    return;
  }

  // --- Qidiruv so'rovi bo'lsa ---
  const query = text.toLowerCase();
  const searchResults = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );

  if (searchResults.length > 0) {
    let resultMsg = `🔎 <b>"${text}" bo'yicha topilgan mahsulotlar:</b>\n\n`;
    searchResults.slice(0, 5).forEach((p, idx) => {
      resultMsg += `${idx + 1}. <b>${p.name}</b>\n` +
        `   💰 Narxi: <code>${p.price.toLocaleString()} so'm</code> / ${p.unit}\n` +
        `   📦 Ombor: ${p.stock} dona | ✨ ${p.badge}\n\n`;
    });
    resultMsg += `🛍 <i>Buyurtma qilish uchun quyidagi tugmani bosing:</i>`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🛍 Savatga qo\'shish (Mini App)', web_app: { url: WEB_APP_URL } }]
      ]
    };

    await sendMessage(chatId, resultMsg, keyboard);
    return;
  }

  // Default xushmuomala javob
  await sendMessage(chatId,
    `Hurmatli <b>${userName}</b>, xabaringiz qabul qilindi! 😊\n\n` +
    `Mahsulotlar xarid qilish yoki menyuni ko'rish uchun pastdagi <b>"🛍 Do'konni ochish"</b> tugmasidan foydalaning.`,
    getMainKeyboard()
  );
}

// Start bot
initBot();
