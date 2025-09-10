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



function applyFilters(data, user_state) {
  let filtered = [...data];

  if (user_state.chosenProdi?.length > 0) {
    filtered = filtered.filter((row) =>
      user_state.chosenProdi.some((prodi) =>
        row["Nama Prodi"]?.toLowerCase().includes(prodi.toLowerCase())
      )
    );
  }

  if (user_state.location?.length > 0) {
    filtered = filtered.filter((row) =>
      user_state.location.some((loc) =>
        row["Provinsi"]?.toLowerCase().includes(loc.toLowerCase())
      )
    );
  }

  if (user_state.interests?.length > 0) {
    filtered = filtered.filter((row) =>
      user_state.interests.some((interest) =>
        row["Minat"]?.toLowerCase().includes(interest.toLowerCase())
      )
    );
  }

  if (user_state.klaster) {
    filtered = filtered.filter((row) =>
      row["Klaster"]?.toLowerCase().includes(user_state.klaster.toLowerCase())
    );
  }

  return filtered;
}

function getRecommendations(user_state) {
  if (!csvData.length) {
    throw new Error("CSV belum dimuat. Panggil loadCSV() dulu.");
  }

  let filtered = applyFilters(csvData, user_state);

  // fallback bertahap
  if (filtered.length === 0) {
    const relaxedStates = [
      { ...user_state, interests: [] },
      { ...user_state, chosenProdi: [] },
      { ...user_state, location: [] },
      { ...user_state, klaster: null }
    ];

    for (const relaxed of relaxedStates) {
      filtered = applyFilters(csvData, relaxed);
      if (filtered.length > 0) break;
    }
  }

  // sort by rank
  filtered.sort((a, b) => (parseInt(a["Rank"] || 9999)) - (parseInt(b["Rank"] || 9999)));

  const top5 = filtered.slice(0, 5);

  if ((!user_state.chosenProdi?.length) && (!user_state.location?.length)) {
    return `Menurut saya, prodi berikut cocok untuk anda:\n` +
      top5.map((row, i) => `${i + 1}. ${row["Nama Prodi"]}`).join("\n");
  } else {
    return `Menurut saya, universitas berikut cocok untuk anda:\n` +
      top5.map((row, i) =>
        `${i + 1}. ${row["Nama Universitas"]} - ${row["Nama Prodi"]} (${row["Provinsi"]})`
      ).join("\n");
  }
}


module.exports = { loadCSV, getAllUniqueProdi, getClusterFromGrades, getRecommendations };
