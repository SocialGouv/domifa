import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../config";

export const customDocTemplateLoader = {
  loadCustomDocTemplate,
  loadDefaultDocTemplate,
};

const TEMPLATES_NAMES: { [attr in CustomDocTemplateType]: string } = {
  attestation_postale: "attestation_postale.template.docx",
  courrier_radiation: "courrier_radiation.template.docx",
};

const TEMPLATES_PATHS: {
  [attr in CustomDocTemplateType]: string;
} = Object.keys(TEMPLATES_NAMES).reduce((acc, docType) => {
  acc[docType] = path.join(
    __dirname,
    "../../_static/custom-docs/" + TEMPLATES_NAMES[docType]
  );
  return acc;
}, {} as { [attr in CustomDocTemplateType]: string });

export type CustomDocTemplateType =
  | "attestation_postale"
  | "courrier_radiation";

function loadCustomDocTemplate({
  docType,
  structureId,
}: {
  docType: CustomDocTemplateType;
  structureId: number;
}) {
  try {
    // Une version customisée par la structure existe-t-elle ?
    const customTemplatePath = buildCustomDocPath({
      structureId,
      docType,
    });
    return loadTemplateFromFilePath(customTemplatePath);
  } catch (err) {
    // error loading custom path: use default
    return loadDefaultDocTemplate({ docType });
  }
}
function loadDefaultDocTemplate({
  docType,
}: {
  docType: CustomDocTemplateType;
}) {
  const defaultTemplatePath = buildDefaultTemplatePath(docType);
  return loadTemplateFromFilePath(defaultTemplatePath);
}

function buildDefaultTemplatePath(docType: CustomDocTemplateType) {
  return TEMPLATES_PATHS[docType];
}

function buildCustomDocPath({
  structureId,
  docType,
}: {
  structureId: number;
  docType: string;
}) {
  return path.join(
    domifaConfig().upload.basePath,
    `${structureId}`,
    "docs",
    TEMPLATES_NAMES[docType]
  );
}

function loadTemplateFromFilePath(templateFilePath: string) {
  return fs.readFileSync(path.resolve(templateFilePath), "binary");
}
