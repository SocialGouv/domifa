import * as fs from "fs";
// var mammoth = require("mammoth");
import * as mammoth from "mammoth";
import * as path from "path";
import { domifaConfig } from "../../config";
import {
  customDocTemplateLoader,
  CustomDocTemplateType,
} from "./customDocTemplateLoader.service";
import { generateCustomDoc } from "./generateCustomDoc.service";
import { generatedAttestationMock } from "./mocks/generatedAttestationMock";
describe("generateCustomDoc", () => {
  it("generateCustomDoc render attestation_postale", async () => {
    await runDocTypeTest({ docType: "attestation_postale" });
  });
  it("generateCustomDoc render attestation_postale", async () => {
    await runDocTypeTest({ docType: "courrier_radiation" });
  });
});
async function runDocTypeTest({ docType }: { docType: CustomDocTemplateType }) {
  let content = customDocTemplateLoader.loadDefaultDocTemplate({
    docType,
  });

  const generatedDoc: Buffer = generateCustomDoc(
    content,
    generatedAttestationMock
  );

  // generate html from doc to make it easier to compare
  const { value: generatedDocHtml } = await mammoth.convertToHtml({
    buffer: generatedDoc,
  });

  if (domifaConfig().envId === "dev") {
    // in dev mode, we want to be able to open the file in browser or copy "tmp" as "ref" file
    // To enable dev mode, run locally:
    // npx jest -- generateCustomDoc.service.spec.ts
    const tmpHtmlPath = path.join(
      __dirname,
      "../../_static/custom-docs/test",
      `${docType}.docx.tmp.html`
    );
    fs.writeFileSync(tmpHtmlPath, generatedDocHtml);
  }

  const expectedGeneratedDocHtml = fs
    .readFileSync(
      path.join(
        __dirname,
        "../../_static/custom-docs/test",
        `${docType}.docx.ref.html`
      )
    )
    .toString();
  expect(expectedGeneratedDocHtml).toEqual(generatedDocHtml);
}
