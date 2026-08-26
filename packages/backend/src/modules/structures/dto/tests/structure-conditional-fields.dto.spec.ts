import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { StructureAdresseCourrierDto } from "../structure-adresse-courrier.dto";
import { StructureDocDto } from "../structure-doc.dto";
import { StructureEditSmsDto } from "../structure-edit-sms.dto";
import { StructureRegistrationDto } from "../structure-registration-data.dto";

describe("StructureAdresseCourrierDto", () => {
  it("nulls address fields when the mailing address is inactive", async () => {
    const dto = plainToInstance(StructureAdresseCourrierDto, {
      actif: false,
      adresse: "x".repeat(10_000),
      ville: ["not", "a", "string"],
      codePostal: "ABCDEFG",
    });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.adresse).toBeNull();
    expect(dto.ville).toBeNull();
    expect(dto.codePostal).toBeNull();
  });

  it("sanitizes address fields", async () => {
    const dto = plainToInstance(StructureAdresseCourrierDto, {
      actif: true,
      adresse: "  1 rue <b>de la</b>   Paix ",
      ville: "<img src=x onerror=alert(1)>Paris",
      codePostal: "75001",
    });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.adresse).toEqual("1 rue de la Paix");
    expect(dto.ville).toEqual("Paris");
  });

  it("validates address fields when the mailing address is active", async () => {
    const dto = plainToInstance(StructureAdresseCourrierDto, {
      actif: true,
      adresse: "1 rue de la Paix",
      ville: "Paris",
      codePostal: "ABCDE",
    });
    const errors = await validate(dto);
    expect(errors.map((e) => e.property)).toEqual(["codePostal"]);
  });
});

describe("StructureDocDto", () => {
  it("requires a label on a custom document only", async () => {
    const custom = plainToInstance(StructureDocDto, {
      custom: "true",
      customDocType: "attestation_postale",
    });
    expect((await validate(custom)).map((e) => e.property)).toEqual(["label"]);

    const regular = plainToInstance(StructureDocDto, { custom: "false" });
    expect(await validate(regular)).toHaveLength(0);
    expect(regular.label).toBeUndefined();
  });

  it("still validates and sanitizes a label sent with a regular document", async () => {
    const tooLong = plainToInstance(StructureDocDto, {
      custom: "false",
      label: "x".repeat(101),
    });
    expect((await validate(tooLong)).map((e) => e.property)).toEqual(["label"]);

    const tagged = plainToInstance(StructureDocDto, {
      custom: "false",
      label: "<img src=x onerror=alert(1)>Règlement",
    });
    expect(await validate(tagged)).toHaveLength(0);
    expect(tagged.label).toEqual("Règlement");
  });

  it("nulls customDocType on a non-custom document", async () => {
    const dto = plainToInstance(StructureDocDto, {
      custom: "false",
      label: "Règlement intérieur",
      customDocType: "attestation_postale",
    });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.customDocType).toBeNull();
  });

  it("requires a known customDocType on a custom document sent as multipart", async () => {
    const dto = plainToInstance(StructureDocDto, {
      custom: "true",
      label: "Attestation",
      customDocType: "unknown",
    });
    const errors = await validate(dto);
    expect(errors.map((e) => e.property)).toEqual(["customDocType"]);
  });
});

describe("StructureEditSmsDto", () => {
  const schedule = {
    monday: true,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
  };

  it("still validates sender fields when SMS are disabled but values are sent", async () => {
    const dto = plainToInstance(StructureEditSmsDto, {
      enabledByStructure: false,
      senderName: "Nom avec chiffres 123",
      senderDetails: "x".repeat(100),
      schedule,
    });
    const errors = await validate(dto);
    expect(errors.map((e) => e.property).sort()).toEqual([
      "senderDetails",
      "senderName",
    ]);
  });

  it("does not require sender fields when SMS are disabled", async () => {
    const dto = plainToInstance(StructureEditSmsDto, {
      enabledByStructure: false,
      schedule,
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it("requires sender fields when SMS are enabled", async () => {
    const dto = plainToInstance(StructureEditSmsDto, {
      enabledByStructure: true,
      schedule,
    });
    const errors = await validate(dto);
    expect(errors.map((e) => e.property).sort()).toEqual([
      "senderDetails",
      "senderName",
    ]);
  });
});

describe("StructureRegistrationDto", () => {
  it("rejects a non-boolean dsp", async () => {
    const dto = plainToInstance(StructureRegistrationDto, {
      source: "PROSPECTION_DIRECTE",
      activeUsersCount: 3,
      currentTool: "PAPIER",
      dsp: "yes",
    });
    const errors = await validate(dto);
    expect(errors.map((e) => e.property)).toEqual(["dsp"]);
  });

  it("nulls marketTool fields when no market tool is used", async () => {
    const dto = plainToInstance(StructureRegistrationDto, {
      source: "PROSPECTION_DIRECTE",
      activeUsersCount: 3,
      currentTool: "PAPIER",
      marketTool: "whatever",
      marketToolOther: "x".repeat(5_000),
    });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.marketTool).toBeNull();
    expect(dto.marketToolOther).toBeNull();
  });
});
