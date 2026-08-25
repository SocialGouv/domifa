import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { TelephoneDto } from "../../../../_common/dto/telephone.dto";
import { CreateUsagerDto } from "../create-usager.dto";

const base = {
  sexe: "homme",
  nom: "Dupont",
  prenom: "Jean",
  dateNaissance: "1990-01-01",
  villeNaissance: "Paris",
  contactByPhone: false,
};

describe("CreateUsagerDto — telephone and ayantsDroits", () => {
  it("strips unknown keys from the nested telephone object", async () => {
    const dto = plainToInstance(CreateUsagerDto, {
      ...base,
      telephone: { countryCode: "fr", numero: "0612345678", injected: "x" },
    });
    expect(await validate(dto, { whitelist: true })).toHaveLength(0);
    expect(dto.telephone).toEqual({ countryCode: "fr", numero: "0612345678" });
  });

  it("rejects an invalid countryCode even when the number is empty", async () => {
    const dto = plainToInstance(CreateUsagerDto, {
      ...base,
      telephone: { countryCode: "x".repeat(500), numero: "" },
    });
    const errors = await validate(dto, { whitelist: true });
    expect(errors.map((e) => e.property)).toEqual(["telephone"]);
  });

  it("bounds the phone number length before libphonenumber parses it", async () => {
    const dto = plainToInstance(TelephoneDto, {
      countryCode: "fr",
      numero: "0".repeat(21),
    });
    const errors = await validate(dto);
    expect(errors.map((e) => e.property)).toEqual(["numero"]);
  });

  it("rejects a non-array ayantsDroits", async () => {
    const dto = plainToInstance(CreateUsagerDto, {
      ...base,
      telephone: { countryCode: "fr", numero: "" },
      ayantsDroits: { injected: true },
    });
    const errors = await validate(dto, { whitelist: true });
    expect(errors.map((e) => e.property)).toEqual(["ayantsDroits"]);
  });
});
