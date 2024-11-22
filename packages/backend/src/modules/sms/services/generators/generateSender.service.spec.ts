import { generateSender } from "./generateSender.service";

describe("generateSender", () => {
  it("should remove accents, non-alphanumeric characters, limit length, and convert to uppercase", () => {
    expect(generateSender("Àlternáte")).toEqual("ALTERNATE");
    expect(generateSender("Çoòl-Pröjëct")).toEqual("COOLPROJECT");
    expect(generateSender("Çoòl-PröjëctX135256")).toEqual("COOLPROJECT");
    expect(generateSender("Dîffèrent Çhàractérs")).toEqual("DIFFERENT C");
    expect(
      generateSender("Èxtra Löng Nàme with Môre than Éleven Chàracters")
    ).toEqual("EXTRA LONG");
  });

  it("should handle empty strings", () => {
    expect(generateSender("")).toEqual("");
  });

  it("should handle strings with only non-alphanumeric characters", () => {
    expect(generateSender("!!!***???")).toEqual("");
  });
});
