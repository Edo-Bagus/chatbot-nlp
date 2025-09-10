// wa-client.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { loadCSV, getAllUniqueProdi } = require('../services/datasource'); // Mengimpor loadCSV dari datasource
const { handleInput } = require('./bot'); // Mengimpor handleInput dari file bot.js
const bot = require('./bot');

const client = new Client({
    // authStrategy: new LocalAuth()
});

let DATABASE_PRODI = [];

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

    const userInput = msg.body;
    const botResponse = bot.handleInput(userInput);

    msg.reply(botResponse);
});

async function initializeBot() {
    try {
        console.log("Memuat data CSV...");
        await loadCSV("data/cleaned/cleaned_data.csv");
        console.log("Data CSV berhasil dimuat!\n");
        // Mengisi DATABASE_PRODI setelah data siap
        DATABASE_PRODI.push(...getAllUniqueProdi());
        
        client.initialize();
    } catch (error) {
        console.error("Terjadi error saat memuat data:", error.message);
    }
}

initializeBot();