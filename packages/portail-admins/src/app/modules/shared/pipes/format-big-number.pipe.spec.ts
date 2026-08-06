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

  it("should return empty string for NaN", () => {
    expect(pipe.transform(NaN)).toBe("");
  });

  it("should return empty string for null (runtime bypass)", () => {
    expect(pipe.transform(null as unknown as number)).toBe("");
  });

  it("should return empty string for undefined", () => {
    expect(pipe.transform(undefined as unknown as number)).toBe("");
  });

  it("should format a large number with spaces", () => {
    expect(pipe.transform(1000000)).toBe("1 000 000");
  });

  it("should handle numbers smaller than 1000", () => {
    expect(pipe.transform(42)).toBe("42");
  });
});
