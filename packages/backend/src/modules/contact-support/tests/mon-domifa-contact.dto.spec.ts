import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { MonDomifaContactDto } from "../mon-domifa-contact.dto";

const VALID = {
  nom: "Dupont",
  prenom: "Jean",
  email: "Jean.Dupont@Example.org",
  phone: "",
  regionCode: "11",
  departement: "93",
  structureName: "CCAS de Saint-Denis",
  subject: "AUTRE",
  content: "Je n'arrive pas à consulter mes courriers.\n\nMerci",
};

const build = (overrides: Record<string, unknown> = {}) =>
  plainToInstance(MonDomifaContactDto, { ...VALID, ...overrides });

const errorFields = async (dto: MonDomifaContactDto) =>
  (await validate(dto, { whitelist: true })).map((e) => e.property);

describe("MonDomifaContactDto", () => {
  it("accepts a valid payload and normalizes it", async () => {
    const dto = build();
    expect(await errorFields(dto)).toEqual([]);
    expect(dto.email).toEqual("jean.dupont@example.org");
    expect(dto.phone).toBeUndefined();
    expect(dto.content).toEqual(
      "Je n'arrive pas à consulter mes courriers.\n\nMerci"
    );
  });

  it("accepts an optional phone number", async () => {
    expect(await errorFields(build({ phone: "+33 6 12 34 56 78" }))).toEqual(
      []
    );
  });

  it("requires a valid email", async () => {
    expect(await errorFields(build({ email: "" }))).toEqual(["email"]);
    expect(await errorFields(build({ email: "pas-un-email" }))).toEqual([
      "email",
    ]);
  });

  it("rejects an invalid phone", async () => {
    expect(await errorFields(build({ phone: "<script>" }))).toEqual(["phone"]);
  });

  it("requires nom, prenom and structureName", async () => {
    expect(
      await errorFields(build({ nom: "", prenom: " ", structureName: "" }))
    ).toEqual(["nom", "prenom", "structureName"]);
  });

  it("only accepts subjects sent to the support team", async () => {
    expect(
      await errorFields(build({ subject: "PROBLEME_ACCESSIBILITE" }))
    ).toEqual([]);
    expect(
      await errorFields(build({ subject: "MOT_DE_PASSE_IDENTIFIANT" }))
    ).toEqual(["subject"]);
    expect(
      await errorFields(build({ subject: "INFORMATION_COURRIER" }))
    ).toEqual(["subject"]);
    expect(await errorFields(build({ subject: "FORMATION" }))).toEqual([
      "subject",
    ]);
  });

  it("does not require a message for a data deletion request", async () => {
    expect(
      await errorFields(build({ subject: "SUPPRESSION_DONNEES", content: "" }))
    ).toEqual([]);
    expect(
      await errorFields(
        build({ subject: "SUPPRESSION_DONNEES", content: "court" })
      )
    ).toEqual(["content"]);
    expect(await errorFields(build({ subject: "AUTRE", content: "" }))).toEqual(
      ["content"]
    );
  });

  it("region and departement are optional but must exist", async () => {
    expect(
      await errorFields(build({ regionCode: "", departement: "" }))
    ).toEqual([]);
    expect(
      await errorFields(build({ regionCode: "XX", departement: "999" }))
    ).toEqual(["regionCode", "departement"]);
  });

  it("strips html from free text", async () => {
    const dto = build({ content: "<b>Bonjour</b> j'ai un problème" });
    expect(await errorFields(dto)).toEqual([]);
    expect(dto.content).toEqual("Bonjour j'ai un problème");
  });

  it("requires a 10 characters message", async () => {
    expect(await errorFields(build({ content: "court" }))).toEqual(["content"]);
  });
});
