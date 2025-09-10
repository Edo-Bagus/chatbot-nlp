// wa-client.js
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const bot = require('./bot');

const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log("QR Code generated, silakan scan di WhatsApp.");
});

client.on('ready', () => {
    console.log("✅ WhatsApp bot siap!");
});

client.on('message', async (msg) => {
    // Abaikan pesan dari grup atau pesan status
    if (msg.isGroupMsg || msg.from === 'status@broadcast') return;

    const userInput = msg.body?.trim();
  if (!userInput) return; // kalau kosong, abaikan

  try {
    const botResponse = await bot.handleInput(userInput);

    if (typeof botResponse === "string" && botResponse.trim().length > 0) {
      await msg.reply(botResponse);
    } else {
      await msg.reply("⚠️ Maaf, saya tidak bisa memproses pesanmu.");
    }
  } catch (err) {
    console.error("❌ Error bot:", err);
    await msg.reply("Terjadi error saat memproses pesanmu.");
  }
});

async function start() {
  await bot.initBot();
  client.initialize();
}

start();
