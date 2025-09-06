// --- Reflections: mapping kata ganti
const reflections = {
  "aku": "kamu",
  "saya": "anda",
  "kamu": "aku",
  "anda": "saya",
  "milikku": "milikmu",
  "milikmu": "milikku"
};

// Fungsi untuk mengganti kata ganti
function reflect(text) {
  return text.split(" ").map(word => {
    return reflections[word.toLowerCase()] || word;
  }).join(" ");
}

// --- Rules (regex + response)
const rules = [
  {
    pattern: /aku (.*)/i,
    response: (match) => `Kenapa kamu ${reflect(match[1])}?`
  },
  {
    pattern: /saya (.*)/i,
    response: (match) => `Kenapa anda ${reflect(match[1])}?`
  },
  {
    pattern: /halo/i,
    response: () => "Halo! Apa kabar?"
  },
  {
    pattern: /bye/i,
    response: () => "Sampai jumpa! 👋"
  }
];

module.exports = { reflect, rules };
