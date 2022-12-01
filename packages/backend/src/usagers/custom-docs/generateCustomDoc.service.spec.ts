import * as mammoth from "mammoth";

import { readFile, writeFile } from "fs-extra";
import { join } from "path";

import { domifaConfig } from "../../config";
import { StructureDocTypesAvailable } from "../../_common/model";
import { customDocTemplateLoader } from "./customDocTemplateLoader.service";
import { generateCustomDoc } from "./generateCustomDoc.service";
import { generatedAttestationMock } from "./mocks/generatedAttestationMock";

describe("generateCustomDoc", () => {
  it("1. ATTESTATION POSTALE : generateCustomDoc render attestation_postale", async () => {
    await runDocTypeTest({ docType: "attestation_postale" });
  });

  it("2. COURRIER RADIATION : generateCustomDoc render courrier_radiation", async () => {
    await runDocTypeTest({ docType: "courrier_radiation" });
  });
});

async function runDocTypeTest({
  docType,
}: {
  docType: StructureDocTypesAvailable;
}) {
  const content = await customDocTemplateLoader.loadDefaultDocTemplate({
    docType,
  });

  const generatedDoc: Buffer = await generateCustomDoc(
    content,
    generatedAttestationMock
  );

  // generate html from doc to make it easier to compare
  const { value: generatedDocHtml } = await mammoth.convertToHtml({
    buffer: generatedDoc,
  });

  if (domifaConfig().envId === "local") {
    // in dev mode, we want to be able to open the file in browser or copy "tmp" as "ref" file
    // To enable dev mode, run locally:
    // npx jest -- generateCustomDoc.service.spec.ts
    const tmpHtmlPath = join(
      __dirname,
      "../../_static/custom-docs/test",
      `${docType}.docx.tmp.html`
    );
    await writeFile(tmpHtmlPath, generatedDocHtml);
  }

  const file = join(
    __dirname,
    "../../_static/custom-docs/test",
    `${docType}.docx.ref.html`
  );

  const expectedGeneratedDocHtml = await readFile(file, "utf-8");

  expect(expectedGeneratedDocHtml.trim()).toEqual(generatedDocHtml.trim());
}
