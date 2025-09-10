const { reflect } = require("../../bot");

// --- Basic Pronoun Swap ---
test("mengganti 'aku' -> 'kamu' dan 'kamu' -> 'aku'", () => {
  expect(reflect("aku suka kamu")).toBe("kamu suka aku");
});

test("mengganti 'saya' -> 'anda' dan 'anda' -> 'saya'", () => {
  expect(reflect("saya percaya anda")).toBe("anda percaya saya");
});

// --- Possessive Pronoun Swap ---
test("mengganti 'milikku' -> 'milikmu' dan 'milikmu' -> 'milikku'", () => {
  expect(reflect("ini milikku bukan milikmu")).toBe("ini milikmu bukan milikku");
});

// --- Mixed Case Handling ---
test("tetap bisa mengganti meskipun huruf besar kecil berbeda", () => {
  expect(reflect("Aku sayang Kamu")).toBe("kamu sayang aku");
  expect(reflect("SAYA percaya ANDA")).toBe("anda percaya saya");
});

// --- No Change For Unmapped Words ---
test("tidak mengubah kata yang tidak ada di kamus", () => {
  expect(reflect("universitas terbaik")).toBe("universitas terbaik");
});
