const readline = require("readline");
const { rules, Context } = require("./bot");

// Buat interface CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "Kamu> "
});

// Context untuk simpan percakapan
const context = new Context();

console.log("Halo 👋, saya *MarBot* (Major Recommendation Bot).");
console.log("Saya bisa bantu kamu menemukan program studi & universitas.");
console.log("Ketik sesuatu untuk mulai, atau ketik 'bye' untuk keluar.\n");

rl.prompt();

rl.on("line", (line) => {
  const input = line.trim();

  // cek rules
  let matched = false;
  for (let rule of rules) {
    const match = input.match(rule.pattern);
    if (match) {
      const response = rule.response(match, context);
      console.log("MarBot>", response);
      matched = true;
      break;
    }
  }

  if (!matched) {
    console.log("MarBot> Maaf, saya belum paham. Bisa dijelaskan lagi? 🙏");
  }

  if (/bye|dadah|sampai jumpa/i.test(input)) {
    rl.close();
  } else {
    rl.prompt();
  }
});
