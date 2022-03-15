import Docxtemplater from "docxtemplater";
import * as PizZip from "pizzip";
import { appLogger } from "../../util";
import { StructureCustomDocTags } from "../../_common/model/structure-doc/StructureCustomDocTags.type";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const docxTemplater = require("docxtemplater");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const InspectModule = require("docxtemplater/js/inspect-module");

export function generateCustomDoc(
  content: string, // template file content
  docValues: StructureCustomDocTags
): Buffer {
  const iModule = InspectModule();

  let doc: Docxtemplater;

  try {
    const zip = new PizZip(content);
    doc = new docxTemplater(zip, { modules: [iModule], linebreaks: true });
  } catch (error) {
    appLogger.error(`DocTemplater - Opening Doc impossible`, {
      sentry: true,
      extra: {
        error,
      },
    });
    throw error;
  }

  doc.setData(docValues);
  doc.render();
  return doc.getZip().generate({ type: "nodebuffer" });
}
