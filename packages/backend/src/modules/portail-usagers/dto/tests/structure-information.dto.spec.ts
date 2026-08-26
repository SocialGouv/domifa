import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { StructureInformationDto } from "../structure-information.dto";

// Payload posted by the structure information form (DSFR editor output)
const INFORMATION_JSON = `{
  "title": "Fermeture exceptionnelle ",
  "description": "<p>La structure sera <b>fermée</b> le <i>lundi 2 juin</i>.</p><ul><li>Courriers disponibles dès le mardi</li></ul><p>Plus d'infos : <a href=\\"https://www.example.org/horaires\\">nos horaires</a></p>",
  "isTemporary": true,
  "startDate": "2026-06-01T00:00:00.000Z",
  "endDate": "2026-06-03T00:00:00.000Z",
  "type": "closing"
}`;

const build = (overrides: Record<string, unknown> = {}) =>
  plainToInstance(StructureInformationDto, {
    ...JSON.parse(INFORMATION_JSON),
    ...overrides,
  });

// base64 of "<script>alert(1)</script>", built at runtime so the literal never lands in the repo
const SCRIPT_B64 = Buffer.from("<script>alert(1)</script>").toString("base64");

describe("StructureInformationDto — the only HTML field of the API", () => {
  it("keeps the editor markup (bold, italic, list, link) and strips the title", async () => {
    const dto = build();
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.title).toEqual("Fermeture exceptionnelle");
    expect(dto.description).toEqual(
      `<p>La structure sera <b>fermée</b> le <i>lundi 2 juin</i>.</p><ul><li>Courriers disponibles dès le mardi</li></ul><p>Plus d'infos : <a href="https://www.example.org/horaires">nos horaires</a></p>`
    );
    expect(dto.startDate).toBeInstanceOf(Date);
  });

  it("removes scripts, event handlers, unsafe links and unknown tags", async () => {
    const dto = build(
      JSON.parse(`{
        "description": "<p onclick=\\"alert(1)\\">Bonjour</p><script>alert(1)</script><img src=x onerror=alert(1)><a href=\\"javascript:alert(1)\\">clic</a> <a href=\\"data:text/html;base64,${SCRIPT_B64}\\">b64</a> <a href=\\"//evil.example\\">rel</a> <iframe src=\\"https://evil.example\\"></iframe><style>body{display:none}</style><h1>Titre</h1>"
      }`)
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.description).toEqual(
      "<p>Bonjour</p><a>clic</a> <a>b64</a> <a>rel</a> Titre"
    );
  });

  it("keeps mailto links and encodes stray angle brackets", async () => {
    const dto = build(
      JSON.parse(
        `{ "description": "<p>Contact : <a href=\\"mailto:contact@example.org\\">mail</a>, horaires 9h < 12h</p>" }`
      )
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.description).toEqual(
      `<p>Contact : <a href="mailto:contact@example.org">mail</a>, horaires 9h &lt; 12h</p>`
    );
  });

  it("nulls dates on a permanent information and validates them on a temporary one", async () => {
    const permanent = build(
      JSON.parse(
        `{ "isTemporary": false, "startDate": "<script>x</script>", "endDate": 42 }`
      )
    );
    expect(await validate(permanent, { whitelist: true })).toHaveLength(0);
    expect(permanent.startDate).toBeNull();
    expect(permanent.endDate).toBeNull();

    const temporary = build(
      JSON.parse(`{ "isTemporary": true, "endDate": "demain" }`)
    );
    expect(
      (await validate(temporary, { whitelist: true })).map((e) => e.property)
    ).toEqual(["endDate"]);
  });

  it("rejects a description that is not a string or too long once sanitized", async () => {
    const notAString = build(JSON.parse(`{ "description": ["<p>x</p>"] }`));
    expect(
      (await validate(notAString, { whitelist: true })).map((e) => e.property)
    ).toEqual(["description"]);

    const tooLong = build({ description: `<p>${"x".repeat(10_001)}</p>` });
    expect(
      (await validate(tooLong, { whitelist: true })).map((e) => e.property)
    ).toEqual(["description"]);
  });
});
