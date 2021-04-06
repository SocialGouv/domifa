import { UsagersImportCivilite } from "../../schema-generated-model/attributes/UsagersImportCivilite";
import { UsagersImportCiviliteSchema } from "./UsagersImportCiviliteSchema.joi";

describe("UsagersImportCiviliteSchema schema", () => {
  it("valid civilite", async () => {
    expect(
      await UsagersImportCiviliteSchema.validateAsync("H")
    ).toEqual<UsagersImportCivilite>("h");
    expect(
      await UsagersImportCiviliteSchema.validateAsync("h")
    ).toEqual<UsagersImportCivilite>("h");
    expect(
      await UsagersImportCiviliteSchema.validateAsync("F")
    ).toEqual<UsagersImportCivilite>("f");
    expect(
      await UsagersImportCiviliteSchema.validateAsync("f")
    ).toEqual<UsagersImportCivilite>("f");
  });
  it("invalid civilite", async () => {
    await expect(
      UsagersImportCiviliteSchema.validateAsync("X")
    ).rejects.toThrow();
  });
});
