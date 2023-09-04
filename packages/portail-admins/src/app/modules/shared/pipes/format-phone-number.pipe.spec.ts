import { FormatPhoneNumberPipe } from "./format-phone-number.pipe";

describe("FormatPhoneNumberPipe", () => {
  let pipe: FormatPhoneNumberPipe;

  beforeEach(() => {
    pipe = new FormatPhoneNumberPipe();
  });

  it("should format French mobile numbers correctly", () => {
    expect(pipe.transform("+33612345678")).toBe("06 12 34 56 78");
    expect(pipe.transform("0612345678")).toBe("06 12 34 56 78");
    expect(pipe.transform("06.12.34.56.78")).toBe("06 12 34 56 78");
  });

  it("should format French landline numbers correctly", () => {
    expect(pipe.transform("+33123456789")).toBe("01 23 45 67 89");
    expect(pipe.transform("0123456789")).toBe("01 23 45 67 89");
    expect(pipe.transform("01.23.45.67.89")).toBe("01 23 45 67 89");
  });

  // Cas limites
  it("should handle edge cases", () => {
    expect(pipe.transform("")).toBe("");
    expect(pipe.transform("1234")).toBe("12 34");
  });
});
