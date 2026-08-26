import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { InteractionDto } from "../interactions.dto";

// base64 of "<script>alert(1)</script>", built at runtime so the literal never lands in the repo
const SCRIPT_B64 = Buffer.from("<script>alert(1)</script>").toString("base64");

describe("InteractionDto — conditional fields", () => {
  it("nulls incoming-only fields on an outgoing interaction", async () => {
    const dto = plainToInstance(InteractionDto, {
      type: "courrierOut",
      content: "x".repeat(100_000),
      nbCourrier: 999,
      procurationIndex: 1,
    });
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.content).toBeNull();
    expect(dto.nbCourrier).toBeNull();
    expect(dto.procurationIndex).toEqual(1);
  });

  it("nulls procurationIndex and validates nbCourrier on an incoming interaction", async () => {
    const dto = plainToInstance(InteractionDto, {
      type: "courrierIn",
      nbCourrier: 999,
      procurationIndex: 1,
    });
    const errors = await validate(dto, { whitelist: true });
    expect(errors.map((e) => e.property)).toEqual(["nbCourrier"]);
    expect(dto.procurationIndex).toBeNull();
  });
});

describe("InteractionDto — real payloads", () => {
  const build = (json: string) =>
    plainToInstance(InteractionDto, JSON.parse(json));

  it("accepts an incoming mail as posted by the frontend", async () => {
    const dto = build(
      `{ "type": "courrierIn", "content": "Les impôts", "nbCourrier": 1 }`
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.content).toEqual("Les impôts");
    expect(dto.procurationIndex).toBeUndefined();
  });

  it("accepts a parcel note with punctuation", async () => {
    const dto = build(
      `{ "type": "colisIn", "content": "Colis de 2 kg (fragile) - n° 12/2024", "nbCourrier": 1 }`
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.content).toEqual("Colis de 2 kg (fragile) - n° 12/2024");
  });

  it("keeps line breaks for nl2br and collapses the rest", async () => {
    const dto = build(`{
      "type": "courrierIn",
      "nbCourrier": 1,
      "content": "Lettre CAF\\r\\n\\r\\n\\r\\n  Relance\\t\\timpôts  \\n"
    }`);
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.content).toEqual("Lettre CAF\n\nRelance impôts");
  });

  it("sanitizes markup, keeps inert base64 / SQL text, bounds the result", async () => {
    const xss = build(`{
      "type": "courrierIn",
      "nbCourrier": 2,
      "content": "  Lettre <b>recommandée</b>\\n  de la <img src=x onerror=alert(1)>CAF "
    }`);
    expect(await validate(xss, { whitelist: true })).toHaveLength(0);
    expect(xss.content).toEqual("Lettre recommandée\nde la CAF");

    const inert = build(`{
      "type": "courrierIn",
      "nbCourrier": 1,
      "content": "data:text/html;base64,${SCRIPT_B64} '; DROP TABLE interaction; --"
    }`);
    expect(await validate(inert, { whitelist: true })).toHaveLength(0);
    expect(inert.content).toEqual(
      `data:text/html;base64,${SCRIPT_B64} '; DROP TABLE interaction; --`
    );

    const mostlyTags = build(
      `{ "type": "courrierIn", "nbCourrier": 1, "content": "${"<p></p>".repeat(
        2000
      )}ok" }`
    );
    expect(await validate(mostlyTags, { whitelist: true })).toHaveLength(0);
    expect(mostlyTags.content).toEqual("ok");

    const tooLong = build(
      `{ "type": "courrierIn", "nbCourrier": 1, "content": "${"x".repeat(
        5001
      )}" }`
    );
    expect(
      (await validate(tooLong, { whitelist: true })).map((e) => e.property)
    ).toEqual(["content"]);
  });

  it("rejects a non-string content and out-of-range counters", async () => {
    const dto = build(
      `{ "type": "courrierIn", "nbCourrier": 101, "content": { "$ne": null } }`
    );
    expect(
      (await validate(dto, { whitelist: true })).map((e) => e.property).sort()
    ).toEqual(["content", "nbCourrier"]);
  });
});
