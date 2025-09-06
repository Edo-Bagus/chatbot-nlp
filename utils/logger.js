// utils/logger.js
const fs = require("fs");
const path = require("path");

function logMessage(type, content) {
  const date = new Date();
  const logDir = path.join(__dirname, "..", "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const file = path.join(logDir, `${date.toISOString().split("T")[0]}.log`);
  const time = date.toISOString();

  const line = `[${time}] [${type}] ${content}\n`;
  fs.appendFileSync(file, line);
}

module.exports = { logMessage };
