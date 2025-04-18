import { StructureDocTypesAvailable } from "@domifa/common";
import { customDocTemplateLoader } from "../customDocTemplateLoader";

describe("customDocTemplateLoader", () => {
  it("customDocTemplateLoader render ", async () => {
    const template = await customDocTemplateLoader.loadDefaultDocTemplate({
      docType: StructureDocTypesAvailable.attestation_postale,
    });
    expect(template).toBeDefined();
  });
});
