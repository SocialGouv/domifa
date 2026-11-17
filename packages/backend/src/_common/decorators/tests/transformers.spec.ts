import { plainToInstance } from "class-transformer";
import { IsEmail, IsOptional, IsString, validate } from "class-validator";

import { LowerCaseTransform, stripTags } from "../transformers";

class EmailDto {
  @IsString()
  @IsEmail()
  @LowerCaseTransform()
  public email!: string;

  @IsOptional()
  @IsEmail()
  @LowerCaseTransform()
  public optionalEmail?: string;
}

describe("LowerCaseTransform", () => {
  const build = (value: Record<string, unknown>) =>
    plainToInstance(EmailDto, value);

  it("lowercases strings", async () => {
    const dto = build({ email: "Jean.Dupont@Example.ORG" });
    expect(dto.email).toEqual("jean.dupont@example.org");
    expect(await validate(dto)).toEqual([]);
  });

  it("leaves non-string values untouched so that they are rejected", async () => {
    const dto = build({ email: ["A@B.fr"] });
    expect(dto.email).toEqual(["A@B.fr"]);
    const errors = await validate(dto);
    expect(errors.map((e) => e.property)).toEqual(["email"]);
  });

  it("turns empty strings into null so optional fields are skipped", async () => {
    const dto = build({ email: "a@b.fr", optionalEmail: "" });
    expect(dto.optionalEmail).toBeNull();
    expect(await validate(dto)).toEqual([]);
  });
});

describe("stripTags", () => {
  it("removes tags", () => {
    expect(stripTags("<b>Bonjour</b> <img src=x onerror=alert(1)>")).toEqual(
      "Bonjour"
    );
  });

  it("removes invisible control and bidirectional characters", () => {
    expect(
      stripTags("abc\u202Edef\u0000\u0007\u200F", {
        removeInvisibleChars: true,
      })
    ).toEqual("abcdef");
    // Opt-in: only NUL bytes are removed by default
    expect(stripTags("abc\u202Edef\u0000")).toEqual("abc\u202Edef");
    expect(stripTags("ligne 1\r\nligne 2", { multiline: true })).toEqual(
      "ligne 1\nligne 2"
    );
  });

  it("keeps accents and emojis", () => {
    expect(stripTags("Élodie 👩‍👧")).toEqual("Élodie 👩‍👧");
  });
});
