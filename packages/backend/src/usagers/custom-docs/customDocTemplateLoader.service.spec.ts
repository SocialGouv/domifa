import { customDocTemplateLoader } from "./customDocTemplateLoader.service";

describe("customDocTemplateLoader", () => {
  it("customDocTemplateLoader render ", async () => {
    const template = customDocTemplateLoader.loadCustomDocTemplate({
      docType: "attestation_postale",
      structureId: 55,
    });
    expect(template).toBeDefined();
  });
});
