import { buildWords, clean, trim } from "./searchCore";

it("trim", () => {
  expect(trim("  \ttwo  words\n   \t  ")).toEqual("two  words");
});

it("clean", () => {
  expect(clean("à la Câmpagne éÂ!")).toEqual("a la campagne ea ");
});

it("buildWords", () => {
  expect(buildWords("a few words")).toEqual(["a", "few", "words"]);
  expect(buildWords("two_words    ")).toEqual(["two", "words"]);
});
