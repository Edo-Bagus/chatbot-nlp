const { loadCSV, getClusterFromGrades, getRecommendations, mapInterestsToCategories  } = require("../services/datasource");

beforeAll(async () => {
  // Load dataset sekali sebelum semua test jalan
  await loadCSV("data/cleaned/cleaned_data.csv");
});

describe("getRecommendations()", () => {
  test("Fallback: jika user_state kosong → tetap dapat 5 prodi", () => {
    const user_state = { interests: [], klaster: null, chosenProdi: [], location: [] };
    const result = getRecommendations(user_state);

    expect(typeof result).toBe("string");
    expect(result).toMatch(/prodi berikut cocok untuk anda/i);
    const lines = result.split("\n").slice(1); // buang kalimat pembuka
    expect(lines.length).toBe(5);
  });

  test("Filter berdasarkan interests", () => {
    const user_state = { interests: ["sains dan alam"], klaster: null, chosenProdi: [], location: [] };
    const result = getRecommendations(user_state);

    expect(result).toMatch(/prodi berikut cocok untuk anda/i);
    expect(result.toLowerCase()).toMatch(/biologi/);
  });

  test("Filter berdasarkan klaster (SAINTEK)", () => {
    const grades = { matematika: 90, fisika: 85, kimia: 80 };
    const klaster = getClusterFromGrades(grades);

    const user_state = { interests: [], klaster, chosenProdi: [], location: [] };
    const result = getRecommendations(user_state);

    expect(result).toMatch(/prodi berikut cocok untuk anda/i);
    expect(result.toLowerCase()).toMatch(/fisika/);
  });

  test("Filter berdasarkan klaster (SOSHUM)", () => {
    const grades = { ekonomi: 88, sosiologi: 90, "bahasa inggris": 85 };
    const klaster = getClusterFromGrades(grades);

    const user_state = { interests: [], klaster, chosenProdi: [], location: [] };
    const result = getRecommendations(user_state);

    expect(result).toMatch(/prodi berikut cocok untuk anda/i);
    expect(result.toLowerCase()).toMatch(/ekonomi/);
  });

  test("Filter berdasarkan chosenProdi", () => {
    const user_state = { interests: [], klaster: null, chosenProdi: ["kedokteran"], location: [] };
    const result = getRecommendations(user_state);

    expect(result).toMatch(/universitas berikut cocok untuk anda/i);
    expect(result.toLowerCase()).toMatch(/kedokteran/);
  });

  test("Filter berdasarkan location", () => {
    const user_state = { interests: [], klaster: null, chosenProdi: [], location: ["aceh"] };
    const result = getRecommendations(user_state);

    expect(result).toMatch(/universitas berikut cocok untuk anda/i);
    expect(result.toLowerCase()).toMatch(/aceh/);
  });

  test("Kombinasi: interests + klaster + chosenProdi + location", () => {
    const grades = { matematika: 85, fisika: 82, kimia: 78, biologi: 90 };
    const klaster = getClusterFromGrades(grades);

    const user_state = {
      interests: ["kimia"],
      klaster,
      chosenProdi: ["pendidikan kimia"],
      location: ["aceh"],
    };
    const result = getRecommendations(user_state);

    expect(result).toMatch(/universitas berikut cocok untuk anda/i);
    expect(result.toLowerCase()).toMatch(/kimia/);
    expect(result.toLowerCase()).toMatch(/aceh/);
  });

  test("Multiple chosenProdi (union)", () => {
    const user_state = { interests: [], klaster: null, chosenProdi: ["kedokteran", "farmasi"], location: [] };
    const result = getRecommendations(user_state);

    expect(result).toMatch(/universitas berikut cocok untuk anda/i);
    // harus ada salah satu prodi dari daftar
    expect(result.toLowerCase()).toMatch(/kedokteran|farmasi/);
  });

  test("Multiple location (union)", () => {
    const user_state = { interests: [], klaster: null, chosenProdi: [], location: ["aceh", "sumatera utara"] };
    const result = getRecommendations(user_state);

    expect(result).toMatch(/universitas berikut cocok untuk anda/i);
    expect(result.toLowerCase()).toMatch(/aceh|sumatera utara/);
  });
});

describe("mapInterestsToCategories()", () => {
  test("Jika input kosong → return []", () => {
    expect(mapInterestsToCategories([])).toEqual([]);
    expect(mapInterestsToCategories(null)).toEqual([]);
  });

  test("Mapping minat tunggal ke kategori", () => {
    expect(mapInterestsToCategories(["menyanyi"])).toEqual(["Seni Pertunjukan"]);
    expect(mapInterestsToCategories(["coding"])).toEqual(["Teknologi dan Komputer"]);
  });

  test("Mapping multiple minat ke kategori berbeda", () => {
    const result = mapInterestsToCategories(["menyanyi", "coding"]);
    expect(result).toContain("Seni Pertunjukan");
    expect(result).toContain("Teknologi dan Komputer");
    expect(result.length).toBe(2);
  });

  test("Case-insensitive mapping", () => {
    expect(mapInterestsToCategories(["MeNyAnYi"])).toEqual(["Seni Pertunjukan"]);
    expect(mapInterestsToCategories(["CODING"])).toEqual(["Teknologi dan Komputer"]);
  });

  test("Minat tidak ada di mapping → diabaikan", () => {
    expect(mapInterestsToCategories(["jalan-jalan", "belanja"])).toEqual([]);
  });
});
