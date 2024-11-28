import { searchCore } from "./searchCore";

it("trim", () => {
  expect(searchCore.trim("  \ttwo  words\n   \t  ")).toEqual("two  words");
});

it("clean", () => {
  expect(searchCore.clean("à la Câmpagne éÂ!")).toEqual("a la campagne ea ");
});

it("buildWords", () => {
  expect(searchCore.buildWords("a few words")).toEqual(["a", "few", "words"]);
  expect(searchCore.buildWords("two_words    ")).toEqual(["two", "words"]);
});
