const { reflect, rules } = require("../bot");

test("reflect harus mengganti aku -> kamu", () => {
  expect(reflect("aku suka kamu")).toBe("kamu suka aku");
});

test("rule regex untuk 'aku' berfungsi", () => {
  const input = "Aku merasa sedih";
  const match = input.match(rules[0].pattern);
  const response = rules[0].response(match);
  expect(response).toBe("Kenapa kamu merasa sedih?");
});

test("rule regex untuk 'saya' berfungsi", () => {
  const input = "Saya ingin liburan";
  const match = input.match(rules[1].pattern);
  const response = rules[1].response(match);
  expect(response).toBe("Kenapa anda ingin liburan?");
});
