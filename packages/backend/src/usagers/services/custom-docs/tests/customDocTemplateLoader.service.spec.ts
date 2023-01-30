import { customDocTemplateLoader } from "../customDocTemplateLoader.service";

describe("customDocTemplateLoader", () => {
  it("customDocTemplateLoader render ", async () => {
    const template = customDocTemplateLoader.loadDefaultDocTemplate({
      docType: "attestation_postale",
    });
    expect(template).toBeDefined();
  });
});
