import { BadRequestException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { TelephoneDto } from "../telephone.dto";
import { CreateUsagerDto } from "../../../usagers/dto/decision-form/create-usager.dto";
import { ContactDetailsDto } from "../../../usagers/dto/contact-details.dto";
import { StructureDto } from "../../../modules/structures/dto/structure.dto";
import { ContactSupportDto } from "../../../modules/contact-support/contact-support.dto";
import { getPhoneString } from "../../../util/phone";

// Payload posted by the frontend "nouvel usager" form
const USAGER_JSON = `{
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
  "ayantsDroits": [],
  "numeroDistribution": null
}`;

// Payload posted by the public structure registration form
const STRUCTURE_JSON = `{
  "structureType": "cias",
  "adresse": "1 rue de Pessac",
  "nom": "CIAS Pessac",
  "complementAdresse": "",
  "capacite": 50,
  "codePostal": "33600",
  "ville": "Pessac",
  "agrement": "",
  "departement": "33",
  "email": "contact@cias-pessac.fr",
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

// multipart/form-data body of the contact-support form (phone is JSON-encoded)
const SUPPORT_JSON = `{
  "email": "Contact@Example.ORG",
  "name": "Jane Doe",
  "structureName": "CCAS de Test",
  "subject": "Question sur mon dossier",
  "content": "Bonjour, j'ai une question sur mon dossier.",
  "phone": "{\\"countryCode\\":\\"fr\\",\\"numero\\":\\"01 45 67 89 01\\"}"
}`;

const usagerWith = (telephone: unknown) =>
  plainToInstance(CreateUsagerDto, { ...JSON.parse(USAGER_JSON), telephone });
const structureWith = (telephone: unknown) =>
  plainToInstance(StructureDto, { ...JSON.parse(STRUCTURE_JSON), telephone });
const supportWith = (phone: unknown) =>
  plainToInstance(ContactSupportDto, { ...JSON.parse(SUPPORT_JSON), phone });

// IsValidPhone throws a BadRequestException synchronously from validate();
// the ValidationPipe awaits it, so the client still receives a 400.
const expectPhoneRejected = (dto: object, field = "telephone") => {
  let thrown: unknown;
  try {
    validate(dto, { whitelist: true });
  } catch (e) {
    thrown = e;
  }
  expect(thrown).toBeInstanceOf(BadRequestException);
  expect((thrown as BadRequestException).getResponse()).toMatchObject({
    error: "INVALID_PHONE_FORMAT",
    field,
  });
};

describe("TelephoneDto — raw shape", () => {
  it("accepts every format the frontend and the import can send, untouched", async () => {
    for (const numero of [
      "0606060606",
      "06 06 06 06 06",
      "06-02 03/04 05",
      "+33 6 06 06 06 06",
      "+33 (0)6 06 06 06 06",
      "",
    ]) {
      const dto = plainToInstance(TelephoneDto, { countryCode: "fr", numero });
      expect(await validate(dto)).toHaveLength(0);
      expect(dto.numero).toEqual(numero);
    }
  });

  it("only accepts lowercase country codes from the shared COUNTRY_CODES list", async () => {
    for (const countryCode of ["FR", "xx", "fra", "fr<b>", "", 33, null]) {
      const dto = plainToInstance(TelephoneDto, {
        countryCode,
        numero: "0606060606",
      });
      expect((await validate(dto)).map((e) => e.property)).toEqual([
        "countryCode",
      ]);
    }
  });

  it("rejects letters, markup or an oversized numero before libphonenumber", async () => {
    for (const numero of [
      "0606060606 poste 12",
      "<script>alert(1)</script>",
      "0606060606; DROP TABLE usager",
      "0".repeat(21),
      606060606,
      null,
    ]) {
      const dto = plainToInstance(TelephoneDto, { countryCode: "fr", numero });
      expect((await validate(dto)).map((e) => e.property)).toEqual(["numero"]);
    }
  });
});

describe("IsValidPhone — applied on usager (mobile only, optional)", () => {
  it("accepts the real payload and keeps the number as sent", async () => {
    const dto = usagerWith({ countryCode: "fr", numero: "0606060606" });
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.telephone).toEqual({ countryCode: "fr", numero: "0606060606" });
  });

  it("reads international and import formats, which persistence normalises", async () => {
    for (const [numero, national] of [
      ["+33 6 06 06 06 06", "0606060606"],
      ["0033606060606", "0606060606"],
      ["06-02 03/04 05", "0602030405"],
      ["+262 692 12 34 56", "0692123456"],
    ]) {
      const dto = usagerWith({ countryCode: "fr", numero });
      expect(await validate(dto, { whitelist: true })).toHaveLength(0);
      expect(dto.telephone.numero).toEqual(numero);
      expect(getPhoneString(dto.telephone).replace(/\s+/g, "")).toEqual(
        national
      );
    }
  });

  it("accepts an empty number", async () => {
    const dto = usagerWith({ countryCode: "fr", numero: "" });
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
  });

  it("rejects a landline, a truncated or a foreign-looking number", async () => {
    for (const telephone of [
      { countryCode: "fr", numero: "0102030405" },
      { countryCode: "fr", numero: "+33 1 45 67 89 01" },
      { countryCode: "fr", numero: "0606" },
      { countryCode: "fr", numero: "9906060606" },
      { countryCode: "gb", numero: "0606060606" },
      { countryCode: "xx", numero: "0606060606" },
    ]) {
      expectPhoneRejected(usagerWith(telephone));
    }
  });

  it("rejects an uppercase country code even when libphonenumber accepts it", async () => {
    const dto = usagerWith({ countryCode: "FR", numero: "0606060606" });
    const errors = await validate(dto, { whitelist: true });
    expect(errors.map((e) => e.property)).toEqual(["telephone"]);
    expect(errors[0].children?.map((c) => c.property)).toEqual(["countryCode"]);
  });

  it("rejects anything that is not a telephone object", async () => {
    expectPhoneRejected(usagerWith("0606060606"));

    for (const telephone of [
      `{"countryCode":"fr","numero":"0606060606"}`,
      ["fr", "0606060606"],
      42,
      null,
    ]) {
      const errors = await validate(usagerWith(telephone), { whitelist: true });
      expect(errors.map((e) => e.property)).toEqual(["telephone"]);
    }
  });

  it("strips unknown keys and does not pollute prototypes", async () => {
    const dto = usagerWith(
      JSON.parse(
        `{ "countryCode": "fr", "numero": "0606060606", "injected": "x", "__proto__": { "admin": true } }`
      )
    );
    await validate(dto, { whitelist: true });
    expect(({} as { admin?: boolean }).admin).toBeUndefined();
    expect(Object.keys(dto.telephone)).toEqual(["countryCode", "numero"]);
  });

  it("applies the same policy on the contact-details form", async () => {
    const ok = plainToInstance(
      ContactDetailsDto,
      JSON.parse(
        `{ "email": "", "telephone": { "countryCode": "fr", "numero": "0606060606" }, "contactByPhone": true }`
      )
    );
    expect(await validate(ok, { whitelist: true })).toHaveLength(0);
    expect(ok.email).toBeNull();

    expectPhoneRejected(
      plainToInstance(
        ContactDetailsDto,
        JSON.parse(
          `{ "email": null, "telephone": { "countryCode": "fr", "numero": "0102030405" }, "contactByPhone": false }`
        )
      )
    );
  });
});

describe("IsValidPhone — applied on structure (any line, required)", () => {
  it("accepts the real registration payload with a landline", async () => {
    const dto = plainToInstance(StructureDto, JSON.parse(STRUCTURE_JSON));
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.telephone).toEqual({ countryCode: "fr", numero: "0102030405" });
  });

  it("accepts a mobile or an international number", async () => {
    for (const numero of ["0606060606", "+33 1 02 03 04 05"]) {
      const dto = structureWith({ countryCode: "fr", numero });
      expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    }
  });

  it("rejects an empty or invalid number", async () => {
    for (const telephone of [
      { countryCode: "fr", numero: "" },
      { countryCode: "fr", numero: "0102" },
      { countryCode: "gb", numero: "0102030405" },
      null,
      undefined,
    ]) {
      expectPhoneRejected(structureWith(telephone));
    }
  });
});

describe("IsValidPhone — applied on contact-support (multipart, required)", () => {
  it("parses the JSON-encoded phone and validates it as a TelephoneDto", async () => {
    const dto = plainToInstance(ContactSupportDto, JSON.parse(SUPPORT_JSON));
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.phone).toEqual({ countryCode: "fr", numero: "01 45 67 89 01" });
    expect(dto.email).toEqual("contact@example.org");
  });

  it("rejects an empty, malformed or invalid phone", async () => {
    for (const phone of [
      `{"countryCode":"fr","numero":""}`,
      `{"numero":"0145678901"}`,
      `{"countryCode":"fr","numero":"0145"}`,
      "",
    ]) {
      expectPhoneRejected(supportWith(phone), "phone");
    }

    expectPhoneRejected(supportWith("0145678901"), "phone");
  });

  it("drops junk keys smuggled in the JSON string", async () => {
    const dto = supportWith(
      `{"countryCode":"fr","numero":"0145678901","injected":"x","__proto__":{"admin":true}}`
    );
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(Object.keys(dto.phone)).toEqual(["countryCode", "numero"]);
    expect(({} as { admin?: boolean }).admin).toBeUndefined();
  });
});
