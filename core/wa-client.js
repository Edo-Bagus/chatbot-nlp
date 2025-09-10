const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { rules } = require("./bot");
const { logMessage } = require("../utils/logger");
const { loadCSV } = require("../services/datasource");

const client = new Client();

client.on("qr", qr => {
  qrcode.generate(qr, { small: true });
  logMessage("INFO", "QR Code generated, silakan scan di WhatsApp.");
});

client.on("ready", () => {
  console.log("✅ WhatsApp bot siap!");
  logMessage("INFO", "WhatsApp bot siap!");
});

client.on("message", msg => {
  // Skip jika pesan dari grup
  if (msg.from.endsWith("@g.us")) return;

  if (msg.from === "status@broadcast") return;

  const text = msg.body;
  logMessage("INCOMING", `${msg.from}: ${text}`);

  let replied = false;
  for (let rule of rules) {
    const match = text.match(rule.pattern);
    if (match) {
      const reply = typeof rule.response === "function"
        ? rule.response(match)
        : rule.response;

      msg.reply(reply);
      logMessage("OUTGOING", `${msg.to}: ${reply}`);
      replied = true;
      break;
    }
  }

  if (!replied) {
    const fallback = "Bisa ceritakan lebih lanjut?";
    msg.reply(fallback);
    logMessage("OUTGOING", `${msg.to}: ${fallback}`);
  }
});

loadCSV();
client.initialize();
