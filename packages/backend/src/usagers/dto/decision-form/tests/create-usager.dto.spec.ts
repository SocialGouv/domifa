import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateUsagerDto } from "../create-usager.dto";

// Real payload posted by the "nouvel usager" form (see POST_USAGER mock)
const POST_USAGER_JSON = `{
  "sexe": "homme",
  "nom": "Nom test OK ",
  "prenom": "Prénom test OK ",
  "surnom": "Surnom ",
  "dateNaissance": "2022-05-05",
  "villeNaissance": "Monaco",
  "langue": "ar",
  "nationalite": null,
  "customRef": null,
  "email": "test@test.fr",
  "referrerId": null,
  "telephone": { "countryCode": "fr", "numero": "0606060606" },
  "contactByPhone": false,
  "ayantsDroits": [
    {
      "lien": "ENFANT",
      "nom": "Nom AD 1 ",
      "prenom": "Prénom AD 1 ",
      "dateNaissance": "2022-05-02T00:00:00.000Z"
    }
  ],
  "numeroDistribution": null
}`;

const build = (overrides: Record<string, unknown> = {}) =>
  plainToInstance(CreateUsagerDto, {
    ...JSON.parse(POST_USAGER_JSON),
    ...overrides,
  });

const NUL = String.fromCharCode(0);
const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);
const RTL_OVERRIDE = String.fromCharCode(0x202e);

// base64 of "<script>alert(1)</script>", built at runtime so the literal never lands in the repo
const SCRIPT_B64 = Buffer.from("<script>alert(1)</script>").toString("base64");

describe("CreateUsagerDto — real payload", () => {
  it("accepts the frontend payload and trims free text", async () => {
    const dto = build();
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.nom).toEqual("Nom test OK");
    expect(dto.prenom).toEqual("Prénom test OK");
    expect(dto.surnom).toEqual("Surnom");
    expect(dto.customRef).toBeNull();
    expect(dto.numeroDistribution).toBeNull();
    expect(dto.ayantsDroits[0]).toEqual({
      lien: "ENFANT",
      nom: "Nom AD 1",
      prenom: "Prénom AD 1",
      dateNaissance: "2022-05-02T00:00:00.000Z",
    });
  });

  it("drops keys the form never sends", async () => {
    const dto = build(
      JSON.parse(`{ "structureId": 1, "role": "admin", "statut": "VALIDE" }`)
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto).not.toHaveProperty("structureId");
    expect(dto).not.toHaveProperty("role");
    expect(dto).not.toHaveProperty("statut");
  });
});

describe("CreateUsagerDto — corrupted payloads", () => {
  it("strips markup and event handlers from names", async () => {
    const dto = build(
      JSON.parse(`{
        "nom": "<b>Du</b>pont<svg/onload=alert(1)>",
        "prenom": "<img src=x onerror=alert(1)>Jean",
        "surnom": "Jeannot<svg/onload=alert(1)>",
        "villeNaissance": "<a href=\\"javascript:alert(1)\\">Paris</a>",
        "langue": "<!-- c --><b>fr</b>"
      }`)
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.nom).toEqual("Dupont");
    expect(dto.prenom).toEqual("Jean");
    expect(dto.surnom).toEqual("Jeannot");
    expect(dto.villeNaissance).toEqual("Paris");
    expect(dto.langue).toEqual("fr");
  });

  it("keeps the text of script tags and split tags as inert text", async () => {
    // striptags removes tags only: what was inside stays as plain text,
    // which the frontends escape on display.
    const dto = build(
      JSON.parse(`{
        "nom": "<script>alert(1)</script>Dupont",
        "prenom": "<scr<script>ipt>alert(1)</script>",
        "surnom": "&lt;script&gt;alert(1)&lt;/script&gt;",
        "villeNaissance": "<SCRIPT SRC=x></SCRIPT >Paris",
        "langue": "Dupont%3Cscript%3E"
      }`)
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.nom).toEqual("alert(1)Dupont");
    expect(dto.prenom).toEqual("alert(1)");
    expect(dto.surnom).toEqual("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(dto.villeNaissance).toEqual("Paris");
    expect(dto.langue).toEqual("Dupont%3Cscript%3E");
  });

  it("keeps inert text payloads as text (base64, data URI, SQL, formulas)", async () => {
    const dto = build(
      JSON.parse(`{
        "surnom": "data:text/html;base64,${SCRIPT_B64}",
        "customRef": "${SCRIPT_B64}",
        "numeroDistribution": "'; DROP TABLE usager; --",
        "nom": "=HYPERLINK(\\"http://evil\\")",
        "prenom": "javascript:alert(1)"
      }`)
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.surnom).toEqual(`data:text/html;base64,${SCRIPT_B64}`);
    expect(dto.customRef).toEqual(SCRIPT_B64);
    expect(dto.numeroDistribution).toEqual("'; DROP TABLE usager; --");
    expect(dto.nom).toEqual('=HYPERLINK("http://evil")');
    expect(dto.prenom).toEqual("javascript:alert(1)");
  });

  it("keeps reserved characters as typed (Angular escapes on display)", async () => {
    const dto = build(
      JSON.parse(
        `{ "nom": "O'Neil & fils", "prenom": "a < b", "surnom": "{{7*7}} \${7*7} 5$ ~*" }`
      )
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.nom).toEqual("O'Neil & fils");
    expect(dto.prenom).toEqual("a < b");
    expect(dto.surnom).toEqual("{{7*7}} ${7*7} 5$ ~*");
  });

  it("removes NUL bytes but lets invisible unicode through", async () => {
    const dto = build({
      nom: `Dup${NUL}ont`,
      prenom: `Jean${ZERO_WIDTH_SPACE}${RTL_OVERRIDE}naeJ`,
    });
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.nom).toEqual("Dupont");
    expect(dto.prenom).toEqual(`Jean${ZERO_WIDTH_SPACE}${RTL_OVERRIDE}naeJ`);
  });

  it("bounds free text after sanitization", async () => {
    const mostlyTags = build({ nom: `${"<b></b>".repeat(5000)}Dupont` });
    expect(await validate(mostlyTags, { whitelist: true })).toHaveLength(0);
    expect(mostlyTags.nom).toEqual("Dupont");

    const tooLong = build({
      nom: "x".repeat(201),
      surnom: "x".repeat(401),
      customRef: "x".repeat(51),
    });
    expect(
      (await validate(tooLong, { whitelist: true })).map((e) => e.property)
    ).toEqual(["nom", "surnom", "customRef"]);
  });

  it("rejects wrong types instead of coercing them", async () => {
    const dto = build(
      JSON.parse(`{
        "nom": 123,
        "prenom": ["Jean"],
        "surnom": { "$gt": "" },
        "sexe": "autre",
        "dateNaissance": "hier",
        "contactByPhone": "false",
        "ayantsDroits": { "injected": true },
        "email": "<b>test@test.fr</b>"
      }`)
    );
    const errors = await validate(dto, { whitelist: true });
    expect(errors.map((e) => e.property).sort()).toEqual(
      [
        "ayantsDroits",
        "contactByPhone",
        "dateNaissance",
        "email",
        "nom",
        "prenom",
        "sexe",
        "surnom",
      ].sort()
    );
  });

  it("validates ayants droits the same way", async () => {
    const dto = build(
      JSON.parse(`{ "ayantsDroits": [
        { "lien": "<b>ENFANT</b>", "nom": "<img src=x>Nom", "prenom": "", "dateNaissance": "2022-05-02" },
        { "lien": "CONJOINT", "nom": "Ok", "prenom": "Ok", "dateNaissance": "2022-05-02" }
      ] }`)
    );
    const errors = await validate(dto, { whitelist: true });
    expect(errors.map((e) => e.property)).toEqual(["ayantsDroits"]);
    const first = errors[0].children?.[0];
    expect(first?.children?.map((c) => c.property)).toEqual(["prenom"]);
    expect(dto.ayantsDroits[0].nom).toEqual("Nom");
    expect(dto.ayantsDroits[0].lien).toEqual("ENFANT");
  });
});
