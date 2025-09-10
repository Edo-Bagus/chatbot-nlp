const fs = require("fs");
const csv = require("csv-parser");

let csvData = [];

// Load CSV data
function loadCSV(path = "hasil_sidatag.csv") {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => {
        csvData = results;
        resolve(csvData);
      })
      .on("error", reject);
  });
}

/**
 * Ambil semua unique Nama Prodi
 * @returns {String[]} daftar nama prodi unik
 */
function getAllUniqueProdi() {
  if (!csvData.length) {
    throw new Error("CSV belum dimuat. Panggil loadCSV() dulu.");
  }

  const uniqueSet = new Set();
  csvData.forEach((row) => {
    if (row["Nama Prodi"]) {
      uniqueSet.add(row["Nama Prodi"].trim());
    }
  });

  return Array.from(uniqueSet).sort(); // optional: diurutkan alfabetis
}

/**
 * Ubah nilai rapor jadi klaster dominan
 * @param {Object} grades - { matematika: 80, fisika: 75, ... }
 * @returns {String} klaster ("sains teknologi", "agrokompleks", "medika", "sosial humaniora")
 */
function getClusterFromGrades(grades) {
  if (!grades || Object.keys(grades).length === 0) return null;

  const saintekKeys = ["matematika", "fisika", "kimia"];
  const agroKeys = ["biologi", "geografi"];
  const medikaKeys = ["biologi", "kimia"];
  const soshumKeys = [
    "ekonomi",
    "sosiologi",
    "sejarah",
    "bahasa indonesia",
    "bahasa inggris",
  ];

  let saintekScore = 0;
  let agroScore = 0;
  let medikaScore = 0;
  let soshumScore = 0;

  for (const [mapel, nilai] of Object.entries(grades)) {
    const lower = mapel.toLowerCase();
    const score = parseInt(nilai);

    if (saintekKeys.includes(lower)) saintekScore += score;
    if (agroKeys.includes(lower)) agroScore += score;
    if (medikaKeys.includes(lower)) medikaScore += score;
    if (soshumKeys.includes(lower)) soshumScore += score;
  }

  const clusterScores = {
    "sains teknologi": saintekScore,
    agrokompleks: agroScore,
    medika: medikaScore,
    "sosial humaniora": soshumScore,
  };

  const topCluster = Object.entries(clusterScores).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return topCluster && topCluster[1] > 0 ? topCluster[0] : null;
}



/**
 * Fungsi rekomendasi universitas/prodi
 * @param {Object} user_state - { interests: [], klaster: string|null, chosenProdi: [], location: [] }
 * @returns {String} rekomendasi
 */
function getRecommendations(user_state) {
  if (!csvData.length) {
    throw new Error("CSV belum dimuat. Panggil loadCSV() dulu.");
  }

  let filtered = [...csvData];

  // 1. Filter berdasarkan chosenProdi (union)
  if (user_state.chosenProdi && user_state.chosenProdi.length > 0) {
    filtered = filtered.filter((row) =>
      user_state.chosenProdi.some((prodi) =>
        row["Nama Prodi"]?.toLowerCase().includes(prodi.toLowerCase())
      )
    );
  }

  // 2. Filter berdasarkan location (union)
  if (user_state.location && user_state.location.length > 0) {
    filtered = filtered.filter((row) =>
      user_state.location.some((loc) =>
        row["Provinsi"]?.toLowerCase().includes(loc.toLowerCase())
      )
    );
  }

  // 3. Filter berdasarkan interests (union)
  if (user_state.interests && user_state.interests.length > 0) {
    filtered = filtered.filter((row) =>
      user_state.interests.some((interest) =>
        row["Minat"]?.toLowerCase().includes(interest.toLowerCase())
      )
    );
  }

  // 4. Filter berdasarkan klaster (jika ada)
  if (user_state.klaster) {
    filtered = filtered.filter((row) =>
      row["Klaster"]?.toLowerCase().includes(user_state.klaster.toLowerCase())
    );
  }

  // 5. Jika setelah filter kosong → fallback ke full data
  if (filtered.length === 0) {
    filtered = [...csvData];
  }

  // 6. Sortir berdasarkan Rank (jika ada)
  filtered.sort((a, b) => {
    const rankA = parseInt(a["Rank"] || 9999);
    const rankB = parseInt(b["Rank"] || 9999);
    return rankA - rankB;
  });

  const top5 = filtered.slice(0, 5);

  let rekomendasi = "";

  if (
    (!user_state.chosenProdi || user_state.chosenProdi.length === 0) &&
    (!user_state.location || user_state.location.length === 0)
  ) {
    // Mode prodi saja
    const prodiList = top5.map((row, i) => `${i + 1}. ${row["Nama Prodi"]}`);
    rekomendasi = `Menurut saya, prodi berikut cocok untuk anda:\n${prodiList.join(
      "\n"
    )}`;
  } else {
    // Mode universitas + prodi
    const univList = top5.map(
      (row, i) =>
        `${i + 1}. ${row["Nama Universitas"]} - ${row["Nama Prodi"]} (${row["Provinsi"]})`
    );
    rekomendasi = `Menurut saya, universitas berikut cocok untuk anda:\n${univList.join(
      "\n"
    )}`;
  }

  return rekomendasi;
}

module.exports = { loadCSV, getAllUniqueProdi, getClusterFromGrades, getRecommendations };
