// ====== Import Modules ======
const {
  getClusterFromGrades,
  getRecommendations,
  getAllUniqueProdi,
  loadCSV,
} = require("../services/datasource");

// ====== Inisialisasi State dan Konfigurasi ======
let USER_STATE = {
  interests: [],
  klaster: null,
  chosenProdi: [],
  location: [],
  grades: {},
};

let DATABASE_PRODI = [];

async function initBot() {
  await loadCSV("data/cleaned/cleaned_data.csv");
  DATABASE_PRODI = getAllUniqueProdi();
}

const PATTERNS = {
  greetings: /\b(halo|hai|hi|selamat pagi|selamat siang|selamat sore|selamat malam|assalamualaikum)\b/i,
  interest: /\b(minat|suka|hobi)\s+([a-zA-Z\s]+)/i,
  grade: /(?:nilai|nilai saya|input)?\s*([a-zA-Z\s.]+)\s+(\d+)/gi,
  prodi: /\b(prodi|jurusan)\s+([a-zA-Z\s]+)/i,
  location: /(provinsi|daerah|lokasi|di)\s+([a-zA-Z\s]+)/i,
  reset: /\b(reset|ulang|hapus semua)\b/i,
  recall: /\b(status|state|riwayat|saya sudah isi apa)\b/i,
};

const ALIASES = {
  "matematika": ["matematika", "mat", "mtk"],
  "biologi": ["biologi", "bio"],
  "fisika": ["fisika", "fis"],
  "kimia": ["kimia", "kim"],
  "ekonomi": ["ekonomi", "eko"],
  "geografi": ["geografi", "geo"],
  "sosiologi": ["sosiologi", "sosio"],
  "sejarah": ["sejarah", "sej"],
  "bahasa indonesia": [
    "bahasa indonesia",
    "b indo",
    "bindo",
    "b ind",
    "b indonesia",
    "indonesia",
    "b. indonesia",
    "b. indo",
  ],
  "bahasa inggris": [
    "bahasa inggris",
    "inggris",
    "b inggris",
    "b ing",
    "b. ing",
    "b. inggris",
  ],
};

// ====== Fungsi Pembantu ======
function getCanonicalSubject(text) {
  const normalizedText = text.toLowerCase().trim();
  for (const subject in ALIASES) {
    if (ALIASES[subject].includes(normalizedText)) {
      return subject;
    }
  }
  return null;
}

function checkProdiInDatabase(text) {
  for (let p of DATABASE_PRODI) {
    if (text.toLowerCase().includes(p.toLowerCase())) {
      return p;
    }
  }
  return null;
}

// ====== BAGIAN 1: Fungsi untuk mereview data user ======
function getReviewResponse(state) {
  const { interests, klaster, chosenProdi, location, grades } = state;
  const hasInterests = interests.length > 0;
  const hasKlaster = klaster !== null;
  const hasProdi = chosenProdi.length > 0;
  const hasLocation = location.length > 0;
  const hasGrades = Object.keys(grades).length > 0;

  if (!hasInterests && !hasKlaster && !hasProdi && !hasLocation && !hasGrades) {
    return `👋 Halo! Aku *MarBot* 🤖, asisten cerdasmu yang akan membantumu menemukan program studi yang paling cocok 🎓✨.
Yuk, mulai perjalananmu menuju pilihan yang tepat! 🌟
Untuk memulai, boleh tahu minat atau hobi apa yang kamu miliki? 🎨⚽📚`;
  }

  const gradeList = Object.keys(grades)
    .map((subject) => `${subject}: ${grades[subject]}`)
    .join(", ");
  const gradeSentence = hasGrades
    ? `berdasarkan nilai mata pelajaranmu`
    : "";

  if (hasInterests && hasKlaster && hasProdi && hasLocation) {
    return `Baik, ${gradeSentence}, kamu cocok di bidang ${klaster}. Serta minatmu pada ${interests.join(
      ", "
    )}, prodi ${chosenProdi.join(", ")} dan lokasi di ${location.join(", ")}.`;
  }

  if (hasInterests && hasKlaster && hasProdi) {
    return `Oke, ${gradeSentence}, kamu cocok di bidang ${klaster}. Serta minatmu pada ${interests.join(
      ", "
    )} dan juga tertarik pada prodi ${chosenProdi.join(", ")}.`;
  }

  if (hasInterests && hasKlaster && hasLocation) {
    return `Jadi, ${gradeSentence}, kamu cocok di bidang ${klaster}. Serta minatmu pada ${interests.join(
      ", "
    )} dan ingin berkuliah di daerah ${location.join(", ")}.`;
  }

  if (hasInterests && hasProdi && hasLocation) {
    return `Baik, kamu tertarik dengan ${interests.join(
      ", "
    )} dan prodi ${chosenProdi.join(
      ", "
    )} serta ingin kuliah di daerah ${location.join(", ")}.`;
  }

  if (hasKlaster && hasProdi && hasLocation) {
    return `Jadi, kamu cocok di bidang ${klaster}, tertarik pada prodi ${chosenProdi.join(
      ", "
    )}, dan ingin berkuliah di daerah ${location.join(", ")}.`;
  }

  if (hasInterests && hasKlaster) {
    return `Baik, kamu memiliki minat pada ${interests.join(
      ", "
    )} dan cocok di bidang ${klaster}.`;
  }

  if (hasInterests && hasProdi) {
    return `Saya catat, kamu tertarik dengan ${interests.join(
      ", "
    )} dan juga prodi ${chosenProdi.join(", ")}.`;
  }

  if (hasInterests && hasLocation) {
    return `Kamu memiliki minat pada ${interests.join(
      ", "
    )} dan ingin berkuliah di daerah ${location.join(", ")}.`;
  }

  if (hasKlaster && hasProdi) {
    return `Jadi, kamu cocok di bidang ${klaster} dan tertarik pada prodi ${chosenProdi.join(
      ", "
    )}.`;
  }

  if (hasKlaster && hasLocation) {
    return `Dari nilai kamu, kamu cocok di bidang ${klaster}, dan kamu ingin berkuliah di daerah ${location.join(
      ", "
    )}.`;
  }

  if (hasProdi && hasLocation) {
    return `Saya catat, kamu tertarik dengan prodi ${chosenProdi.join(
      ", "
    )} dan ingin berkuliah di daerah ${location.join(", ")}.`;
  }

  if (hasGrades) {
    return `Dari nilai kamu, kamu cocok di bidang ${klaster}).`;
  }
  if (hasInterests) {
    return `Baik, kamu memiliki minat pada ${interests.join(", ")}.`;
  }
  if (hasKlaster) {
    return `Dari nilai kamu, kamu cocok di bidang ${klaster}.`;
  }
  if (hasProdi) {
    return `Saya catat, kamu tertarik dengan prodi ${chosenProdi.join(", ")}.`;
  }
  if (hasLocation) {
    return `Kamu ingin berkuliah di daerah ${location.join(", ")}.`;
  }
}

// ====== BAGIAN 3: Fungsi untuk memberikan panduan ======
function getGuidanceQuestion(state) {
  const { interests, klaster, chosenProdi, location, grades } = state;
  if (interests.length === 0) {
    return `\n\nUntuk memulai, ceritakan minat atau hobimu!`;
  }
  if (Object.keys(grades).length === 0) {
    return `\n\nSelanjutnya, bagaimana dengan nilai mata pelajaranmu? Masukkan dengan format "nilai [pelajaran] [angka]", contoh: "nilai matematika 80".`;
  }
  if (chosenProdi.length === 0) {
    return `\n\nApakah ada program studi tertentu yang sudah kamu minati? Contohnya, "prodi Akuntansi."`;
  }
  if (location.length === 0) {
    return `\n\nTerakhir, apakah ada provinsi atau daerah spesifik yang kamu inginkan untuk kuliah?`;
  }
  return `\n\nData kamu sudah lengkap. Apakah ada hal lain yang ingin kamu ubah atau tanyakan?`;
}

// ====== Fungsi Utama Chatbot ======
async function handleInput(userInput) {
  if (PATTERNS.greetings.test(userInput)) {
    return getReviewResponse(USER_STATE);
  }
  if (PATTERNS.reset.test(userInput)) {
    USER_STATE = {
      interests: [],
      klaster: null,
      chosenProdi: [],
      location: [],
      grades: {},
    };
    return "✅ Semua data kamu sudah direset.";
  }
  if (PATTERNS.recall.test(userInput)) {
    return getReviewResponse(USER_STATE);
  }

  let isInputRecognized = false;
  let handledByThisPrompt = false;

  const gradeMatches = [...userInput.matchAll(PATTERNS.grade)];
  if (gradeMatches.length > 0) {
    gradeMatches.forEach((match) => {
      const subjectText = match[1].trim();
      const gradeValue = parseInt(match[2], 10);
      const canonicalSubject = getCanonicalSubject(subjectText);
      if (canonicalSubject && !isNaN(gradeValue)) {
        USER_STATE.grades[canonicalSubject] = gradeValue;
      }
    });
    USER_STATE.klaster = getClusterFromGrades(USER_STATE.grades);
    isInputRecognized = true;
    handledByThisPrompt = true;
  }

  const interestMatch = userInput.match(PATTERNS.interest);
  if (interestMatch && !handledByThisPrompt) {
    const interest = interestMatch[2].trim();
    if (interest && !USER_STATE.interests.includes(interest)) {
      USER_STATE.interests.push(interest);
    }
    isInputRecognized = true;
    handledByThisPrompt = true;
  }

  const prodiMatch = userInput.match(PATTERNS.prodi);
  if (prodiMatch && !handledByThisPrompt) {
    const prodiDetected = checkProdiInDatabase(prodiMatch[2]);
    if (prodiDetected) {
      if (!USER_STATE.chosenProdi.includes(prodiDetected)) {
        USER_STATE.chosenProdi.push(prodiDetected);
      }
      isInputRecognized = true;
      handledByThisPrompt = true;
    }
  }

  const locationMatch = userInput.match(PATTERNS.location);
  if (locationMatch && !handledByThisPrompt) {
    const location = locationMatch[2].trim();
    if (location && !USER_STATE.location.includes(location)) {
      USER_STATE.location.push(location);
    }
    isInputRecognized = true;
    handledByThisPrompt = true;
  }

  let fullResponse = "";
  if (!isInputRecognized) {
    fullResponse +=
      "Maaf, saya tidak dapat memahami yang anda maksud. Saya akan mereview ulang jawaban Anda.\n\n";
  }

  fullResponse += getReviewResponse(USER_STATE);
  fullResponse += `\n\n${getRecommendations(USER_STATE)}`;
  fullResponse += getGuidanceQuestion(USER_STATE);

  return fullResponse;
}

module.exports = { initBot, handleInput };
