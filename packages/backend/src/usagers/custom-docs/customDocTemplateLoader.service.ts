import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../config";
import { StructureDocTypesAvailable } from "../../_common/model";

export const customDocTemplateLoader = {
  loadCustomDocTemplate,
  loadDefaultDocTemplate,
};

const TEMPLATES_NAMES: { [attr in StructureDocTypesAvailable]: string } = {
  attestation_postale: "attestation_postale.template.docx",
  courrier_radiation: "courrier_radiation.template.docx",
  acces_espace_domicilie: "acces_espace_domicilie.template.docx",
};

const TEMPLATES_PATHS: {
  [attr in StructureDocTypesAvailable]: string;
} = Object.keys(TEMPLATES_NAMES).reduce((acc, docType) => {
  acc[docType] = path.join(
    __dirname,
    "../../_static/custom-docs/" + TEMPLATES_NAMES[docType]
  );
  return acc;
}, {} as { [attr in StructureDocTypesAvailable]: string });

function loadCustomDocTemplate({
  docPath,
  structureId,
}: {
  docPath: string;
  structureId: number;
}) {
  // Une version customisée par la structure existe-t-elle ?
  const customTemplatePath = buildCustomDocPath({
    structureId,
    docPath,
  });
  return loadTemplateFromFilePath(customTemplatePath);
}

function loadDefaultDocTemplate({
  docType,
}: {
  docType: StructureDocTypesAvailable;
}) {
  const defaultTemplatePath = buildDefaultTemplatePath(docType);
  return loadTemplateFromFilePath(defaultTemplatePath);
}

function buildDefaultTemplatePath(docType: StructureDocTypesAvailable) {
  return TEMPLATES_PATHS[docType];
}

function buildCustomDocPath({
  structureId,
  docPath,
}: {
  structureId: number;
  docPath: string;
}) {
  return path.join(
    domifaConfig().upload.basePath,
    `${structureId}`,
    "docs",
    docPath
  );
}

function loadTemplateFromFilePath(templateFilePath: string) {
  return fs.readFileSync(path.resolve(templateFilePath), "binary");
}
