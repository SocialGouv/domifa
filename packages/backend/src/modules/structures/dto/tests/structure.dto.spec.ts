import { BadRequestException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { StructureDto } from "../structure.dto";

// Real payload posted by the public registration form (CIAS)
const CIAS_JSON = `{
  "structureType": "cias",
  "adresse": "1 rue de Pessac",
  "nom": "CIAS Pessac",
  "complementAdresse": "",
  "capacite": 50,
  "codePostal": "33600",
  "ville": "Pessac",
  "agrement": "",
  "departement": "33",
  "email": " contact@cias-pessac.fr ",
  "telephone": { "countryCode": "fr", "numero": "0102030405" },
  "responsable": { "fonction": "Directrice", "nom": "Pompei", "prenom": "Roma" },
  "adresseCourrier": { "actif": false, "adresse": "", "ville": "", "codePostal": "" },
  "options": { "numeroBoite": false, "nomStructure": false, "surnom": false },
  "region": null,
  "regionName": "",
  "departmentName": "",
  "timeZone": "Europe/Paris",
  "organismeType": null,
  "organismeTypeDetail": null,
  "acceptCgu": true,
  "reseau": null,
  "reseauDetail": null,
  "siret": "13000680200016",
  "noSiret": false,
  "registrationData": {
    "source": "PROSPECTION_DIRECTE",
    "sourceDetail": null,
    "activeUsersCount": 150,
    "dsp": false,
    "currentTool": "PAPIER",
    "marketTool": null,
    "marketToolOther": null
  }
}`;

const build = (overrides: Record<string, unknown> = {}) =>
  plainToInstance(StructureDto, { ...JSON.parse(CIAS_JSON), ...overrides });

describe("StructureDto — real payloads", () => {
  it("accepts the CIAS registration payload", async () => {
    const dto = build();
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.email).toEqual("contact@cias-pessac.fr");
    expect(dto.siret).toEqual("13000680200016");
    expect(dto.organismeType).toBeNull();
    expect(dto.reseau).toBeNull();
  });

  it("accepts an association with 'other' organisme and network details", async () => {
    const dto = build(
      JSON.parse(`{
        "structureType": "asso",
        "organismeType": "AUTRE",
        "organismeTypeDetail": " Fondation <b>reconnue</b> ",
        "reseau": "Autre réseau",
        "reseauDetail": "Réseau <img src=x onerror=alert(1)>local"
      }`)
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.organismeTypeDetail).toEqual("Fondation reconnue");
    expect(dto.reseauDetail).toEqual("Réseau local");
  });
});

describe("StructureDto — corrupted payloads", () => {
  it("nulls association-only fields on a CIAS whatever is sent", async () => {
    const dto = build(
      JSON.parse(`{
        "organismeType": "<script>x</script>",
        "organismeTypeDetail": "${"x".repeat(10_000)}",
        "reseau": { "$gt": "" },
        "reseauDetail": 123
      }`)
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.organismeType).toBeNull();
    expect(dto.organismeTypeDetail).toBeNull();
    expect(dto.reseau).toBeNull();
    expect(dto.reseauDetail).toBeNull();
  });

  it("requires association fields once structureType is asso", async () => {
    const dto = build(JSON.parse(`{ "structureType": "asso" }`));
    const errors = await validate(dto, { whitelist: true });
    expect(errors.map((e) => e.property).sort()).toEqual(
      ["organismeType", "reseau"].sort()
    );
  });

  it("nulls market tool fields unless the tool is OUTIL_MARCHE", async () => {
    const dto = build(
      JSON.parse(`{ "registrationData": {
        "source": "PROSPECTION_DIRECTE",
        "sourceDetail": "<b>ignored</b>",
        "activeUsersCount": 150,
        "dsp": false,
        "currentTool": "PAPIER",
        "marketTool": "ADILEOS",
        "marketToolOther": "javascript:alert(1)"
      } }`)
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.registrationData.sourceDetail).toBeNull();
    expect(dto.registrationData.marketTool).toBeNull();
    expect(dto.registrationData.marketToolOther).toBeNull();
  });

  it("cleans a formatted SIRET, nulls it when noSiret, rejects a bogus one", async () => {
    const formatted = build(JSON.parse(`{ "siret": "130 006 802 00016" }`));
    expect(await validate(formatted, { whitelist: true })).toHaveLength(0);
    expect(formatted.siret).toEqual("13000680200016");

    const noSiret = build(
      JSON.parse(`{ "noSiret": true, "siret": "'; DROP TABLE structure; --" }`)
    );
    expect(await validate(noSiret, { whitelist: true })).toHaveLength(0);
    expect(noSiret.siret).toBeNull();

    const bogus = build(JSON.parse(`{ "siret": "12345678901234" }`));
    expect(
      (await validate(bogus, { whitelist: true })).map((e) => e.property)
    ).toEqual(["siret"]);
  });

  it("refuses server-side fields and an unchecked CGU", async () => {
    const dto = build(
      JSON.parse(
        `{ "region": "11", "regionName": "IDF", "departmentName": "Paris", "acceptCgu": "true" }`
      )
    );
    const errors = await validate(dto, { whitelist: true });
    expect(errors.map((e) => e.property).sort()).toEqual(
      ["acceptCgu", "departmentName", "region", "regionName"].sort()
    );
  });

  it("sanitizes nested responsable and mailing address", async () => {
    const dto = build(
      JSON.parse(`{
        "responsable": { "fonction": "<b>Directrice</b>", "nom": "Pompei<svg/onload=alert(1)>", "prenom": "Roma " },
        "adresseCourrier": { "actif": true, "adresse": " 3 place <i>des</i> bois ", "ville": "Cergy", "codePostal": "95801" }
      }`)
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.responsable).toEqual({
      fonction: "Directrice",
      nom: "Pompei",
      prenom: "Roma",
    });
    expect(dto.adresseCourrier.adresse).toEqual("3 place des bois");
  });

  it("rejects the phone through IsValidPhone", () => {
    const dto = build(
      JSON.parse(`{ "telephone": { "countryCode": "fr", "numero": "" } }`)
    );
    expect(() => validate(dto, { whitelist: true })).toThrow(
      BadRequestException
    );
  });
});
