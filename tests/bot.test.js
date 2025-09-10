// __tests__/bot.test.js
const { initBot, handleInput } = require("../core/bot");

// Mock dependencies agar tidak perlu load CSV asli
jest.mock("../services/datasource", () => ({
  getClusterFromGrades: jest.fn((grades) => {
    if (grades.matematika >= 80) return "Sains & Teknologi";
    return "Sosial & Humaniora";
  }),
  getRecommendations: jest.fn(() => "🔎 Rekomendasi: Prodi contoh."),
  getAllUniqueProdi: jest.fn(() => ["Akuntansi", "Teknik Informatika"]),
  loadCSV: jest.fn(async () => true),
}));

beforeAll(async () => {
  await initBot();
});

// ✅ reset state setiap test
beforeEach(async () => {
  await handleInput("reset");
});

describe("Chatbot handleInput()", () => {
  test("should respond to greetings with intro or state", async () => {
    const response = await handleInput("halo");
    expect(response).toMatch(/Halo, saya \*MarBot\*/i);
  });

  test("should reset user state", async () => {
    await handleInput("nilai matematika 90"); // isi dulu state
    const resetResponse = await handleInput("reset");
    expect(resetResponse).toMatch(/✅ Semua data kamu sudah direset./i);
  });

  test("should recall state when asked", async () => {
    await handleInput("minat sepak bola");
    const recallResponse = await handleInput("status saya");
    expect(recallResponse).toMatch(/minat pada sepak bola/i);
  });

  test("should record grades and assign cluster", async () => {
    const response = await handleInput("nilai matematika 85");
    expect(response).toMatch(/cocok di bidang Sains & Teknologi/i);
  });

  test("should record interests", async () => {
    const response = await handleInput("minat desain grafis");
    expect(response).toMatch(/desain grafis/i);
  });

  test("should record prodi if exists in database", async () => {
    const response = await handleInput("prodi Akuntansi");
    expect(response).toMatch(/prodi Akuntansi/i);
  });

  test("should record location", async () => {
    const response = await handleInput("lokasi Jawa Barat");
    expect(response).toMatch(/Jawa Barat/i);
  });

  test("should handle unrecognized input", async () => {
    const response = await handleInput("njanvek");
    expect(response).toMatch(/Maaf, saya tidak dapat memahami/i);
  });

  test("should give full summary when state is complete", async () => {
    await handleInput("minat teknologi");
    await handleInput("nilai matematika 90");
    await handleInput("prodi Teknik Informatika");
    await handleInput("lokasi Jakarta");

    const response = await handleInput("status");
    expect(response).toMatch(/kamu cocok di bidang/i);
    expect(response).toMatch(/minatmu pada teknologi/i);
    expect(response).toMatch(/prodi Teknik Informatika/i);
    expect(response).toMatch(/lokasi di Jakarta/i);
  });
});
