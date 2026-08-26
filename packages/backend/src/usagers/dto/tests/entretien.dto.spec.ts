import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { EntretienDto } from "../entretien.dto";

const build = (json: string) => plainToInstance(EntretienDto, JSON.parse(json));

describe("EntretienDto — conditional details", () => {
  it("accepts a regular frontend payload and sanitizes free text", async () => {
    const dto = build(`{
      "domiciliation": true,
      "revenus": true,
      "revenusDetail": " RSA <b>+</b> APL ",
      "typeMenage": "HOMME_ISOLE_SANS_ENFANT",
      "rattachement": "Famille sur place",
      "liencommune": "AUTRE",
      "liencommuneDetail": "<img src=x onerror=alert(1)>Travail saisonnier",
      "residence": "HEBERGEMENT_TIERS",
      "residenceDetail": "ignoré car residence != AUTRE",
      "orientation": false,
      "orientationDetail": "ignoré car orientation = false",
      "cause": "AUTRE",
      "causeDetail": "Expulsion",
      "raison": "PRESTATIONS_SOCIALES",
      "raisonDetail": "ignoré",
      "accompagnement": true,
      "accompagnementDetail": "Suivi social",
      "commentaires": "RAS",
      "situationPro": "AUTRE",
      "situationProDetail": "Intérim"
    }`);
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.revenusDetail).toEqual("RSA + APL");
    expect(dto.liencommuneDetail).toEqual("Travail saisonnier");
    expect(dto.residenceDetail).toBeNull();
    expect(dto.orientationDetail).toBeNull();
    expect(dto.raisonDetail).toBeNull();
    expect(dto.causeDetail).toEqual("Expulsion");
    expect(dto.accompagnementDetail).toEqual("Suivi social");
    expect(dto.situationProDetail).toEqual("Intérim");
  });

  it("nulls every detail when its discriminator is missing or falsy", async () => {
    const dto = build(`{
      "revenus": false,
      "revenusDetail": "${"x".repeat(5000)}",
      "liencommuneDetail": 123,
      "residenceDetail": ["a"],
      "orientationDetail": {"a": 1},
      "causeDetail": "<script>x</script>",
      "raisonDetail": "x",
      "accompagnementDetail": "x",
      "situationProDetail": "x"
    }`);
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    for (const field of [
      "revenusDetail",
      "liencommuneDetail",
      "residenceDetail",
      "orientationDetail",
      "causeDetail",
      "raisonDetail",
      "accompagnementDetail",
      "situationProDetail",
    ] as const) {
      expect(dto[field]).toBeNull();
    }
  });

  it("validates a detail when its discriminator is set", async () => {
    const tooLong = build(
      `{ "situationPro": "AUTRE", "situationProDetail": "${"x".repeat(1001)}" }`
    );
    expect((await validate(tooLong)).map((e) => e.property)).toEqual([
      "situationProDetail",
    ]);

    const notAString = build(`{ "revenus": true, "revenusDetail": 42 }`);
    expect((await validate(notAString)).map((e) => e.property)).toEqual([
      "revenusDetail",
    ]);

    const truthyButNotBoolean = build(
      `{ "revenus": "true", "revenusDetail": "x" }`
    );
    expect(
      (await validate(truthyButNotBoolean)).map((e) => e.property)
    ).toEqual(["revenus"]);
    expect(truthyButNotBoolean.revenusDetail).toBeNull();
  });
});
