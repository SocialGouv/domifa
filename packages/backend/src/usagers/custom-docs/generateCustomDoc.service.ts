import Docxtemplater from "docxtemplater";
import * as PizZip from "pizzip";
import { appLogger } from "../../util";
import { StructureCustomDoc } from "../../_common/model/structure-doc/StructureCustomDoc.type";
// tslint:disable-next-line: no-var-requires
const docxTemplater = require("docxtemplater");

// tslint:disable-next-line: no-var-requires
const InspectModule = require("docxtemplater/js/inspect-module");

export function generateCustomDoc(
  content: string, // template file content
  docValues: StructureCustomDoc
): Buffer {
  const iModule = InspectModule();

  const zip = new PizZip(content);
  let doc: Docxtemplater;

  try {
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

  try {
    doc.render();
    return doc.getZip().generate({ type: "nodebuffer" });
  } catch (error) {
    appLogger.error(`DocTemplater - Rendering documentimpossible`, {
      sentry: true,
      extra: {
        error,
      },
    });
    throw error;
  }
}
