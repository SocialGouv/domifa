import { parseUsagerRef } from "../parse-pipes/ParseUsagerRef.pipe";

describe("parseUsagerRef", () => {
  it.each([
    ["1", 1],
    ["42", 42],
    ["100000", 100000],
  ])("accepts %s", (value, expected) => {
    expect(parseUsagerRef(value)).toEqual(expected);
  });

  it.each([
    "0",
    "-1",
    "007",
    "100001",
    "99999999999",
    "1e3",
    "0x10",
    "1.5",
    " 1",
    "1 ",
    "",
    "abc",
    undefined,
    null,
    1,
    ["1"],
  ])("rejects %p", (value) => {
    expect(parseUsagerRef(value)).toBeNull();
  });
});
