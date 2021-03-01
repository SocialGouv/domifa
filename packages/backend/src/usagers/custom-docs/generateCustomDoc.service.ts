import { StructureCustomDoc } from "../../_common/model/structure-doc/StructureCustomDoc.type";

import * as PizZip from "pizzip";
import { appLogger } from "../../util";

// tslint:disable-next-line: no-var-requires
const Docxtemplater = require("docxtemplater");
// tslint:disable-next-line: no-var-requires
const InspectModule = require("docxtemplater/js/inspect-module");

export function generateCustomDoc(
  content: string,
  docValues: StructureCustomDoc
) {
  const iModule = InspectModule();

  const zip = new PizZip(content);
  let doc: any;

  try {
    doc = new Docxtemplater(zip, { modules: [iModule], linebreaks: true });
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
