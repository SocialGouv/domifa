import { readFile } from "fs-extra";
import { join, resolve } from "path";
import { StructureDocTypesAvailable } from "../../../_common/model";

export const customDocTemplateLoader = {
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

async function loadDefaultDocTemplate({
  docType,
}: {
  docType: StructureDocTypesAvailable;
}) {
  const defaultTemplatePath = buildDefaultTemplatePath(docType);
  return await readFile(resolve(defaultTemplatePath), "binary");
}

function buildDefaultTemplatePath(docType: StructureDocTypesAvailable) {
  return TEMPLATES_PATHS[docType];
}
