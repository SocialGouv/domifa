import { parseStrictInt } from "../parse-pipes/ParseStrictInt.pipe";
import { toStrictInt } from "../transformers/StrictIntDecorator";

describe("parseStrictInt", () => {
  it.each([
    ["0", 0],
    ["3", 3],
    ["42", 42],
  ])("accepts %s", (value, expected) => {
    expect(parseStrictInt(value)).toEqual(expected);
  });

  it.each([
    "3X3",
    "1e3",
    "0x10",
    "007",
    "-1",
    "+1",
    "1.5",
    " 1",
    "1 ",
    "",
    "1234567890123456",
    undefined,
    null,
    1,
    ["1"],
  ])("rejects %p", (value) => {
    expect(parseStrictInt(value)).toBeNull();
  });

  it("applies the bounds", () => {
    expect(parseStrictInt("0", { min: 1 })).toBeNull();
    expect(parseStrictInt("11", { max: 10 })).toBeNull();
    expect(parseStrictInt("10", { min: 1, max: 10 })).toEqual(10);
  });
});

describe("toStrictInt", () => {
  it("converts a plain integer string", () => {
    expect(toStrictInt("3")).toEqual(3);
  });

  it.each(["3X3", "1e3", "0x10", "007", 1.5, null, undefined])(
    "leaves %p untouched",
    (value) => {
      expect(toStrictInt(value)).toEqual(value);
    }
  );
});
