import { anonymizeEmail } from "./anonymizeEmail";

describe("anonymizeEmail", () => {
  it("should mask the local part and keep the domain readable", () => {
    expect(anonymizeEmail("abdelaziz.sakhi@gmail.com")).toBe(
      "Ab************I@gmail.com"
    );
  });

  it("should handle short local parts", () => {
    expect(anonymizeEmail("ab@gmail.com")).toBe("Ab@gmail.com");
  });

  it("should fall back to generic masking when there is no @", () => {
    expect(anonymizeEmail("notanemail")).toBe("No*******L");
  });

  it("should handle null and undefined", () => {
    expect(anonymizeEmail(null)).toBe("");
    expect(anonymizeEmail(undefined)).toBe("");
  });

  it("should handle empty string", () => {
    expect(anonymizeEmail("")).toBe("");
  });
});
