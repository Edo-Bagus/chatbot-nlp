const fs = require("fs");
const csv = require("csv-parser");

let csvData = [];

function loadCSV(path = "data/cleaned/cleaned_data.csv") {
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

function getRandomReply(column = "Klaster") {
  if (csvData.length === 0) return null;
  const row = csvData[Math.floor(Math.random() * csvData.length)];
  return row[column] || null;
}

module.exports = { loadCSV, getRandomReply };
