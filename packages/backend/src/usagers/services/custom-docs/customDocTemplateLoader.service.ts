import { readFile } from "fs-extra";
import { join, resolve } from "path";
import { domifaConfig } from "../../../config";
import { StructureDocTypesAvailable } from "../../../_common/model";
import { cleanPath } from "../../../util";

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
  acc[docType] = join(
    __dirname,
    "../../../_static/custom-docs/" + TEMPLATES_NAMES[docType]
  );
  return acc;
}, {} as { [attr in StructureDocTypesAvailable]: string });

async function loadCustomDocTemplate({
  docPath,
  structureId,
}: {
  docPath: string;
  structureId: number;
}): Promise<string> {
  // Une version customisée par la structure existe-t-elle ?
  const customTemplatePath = buildCustomDocPath({
    structureId,
    docPath,
  });

  return await loadTemplateFromFilePath(customTemplatePath);
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

export function buildCustomDocPath({
  structureId,
  docPath,
}: {
  structureId: number;
  docPath: string;
}): string {
  return join(
    domifaConfig().upload.basePath,
    "structure-documents",
    cleanPath(`${structureId}`),
    docPath
  );
}

async function loadTemplateFromFilePath(
  templateFilePath: string
): Promise<string> {
  return await readFile(resolve(templateFilePath), "binary");
}
