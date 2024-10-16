import { FormatBigNumberPipe } from "./format-big-number.pipe";

describe("FormatBigNumberPipe", () => {
  let pipe: FormatBigNumberPipe;

  beforeEach(() => {
    pipe = new FormatBigNumberPipe();
  });

  it("should create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("should correctly format big numbers", () => {
    expect(pipe.transform(1234567890)).toEqual("1 234 567 890");
    expect(pipe.transform(100000)).toEqual("100 000");
  });

  it("should handle zero", () => {
    expect(pipe.transform(0)).toEqual("0");
  });
});
