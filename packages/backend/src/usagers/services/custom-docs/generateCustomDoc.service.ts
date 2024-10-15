import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";

import { appLogger } from "../../../util";
import { StructureCustomDocTags } from "../../../_common/model";

export async function generateCustomDoc(
  content: string, // template file content
  docValues: StructureCustomDocTags
): Promise<Buffer> {
  let doc: Docxtemplater;
  try {
    const zip = new PizZip(content);
    doc = new Docxtemplater(zip, { linebreaks: true });
  } catch (error) {
    appLogger.error("DocTemplater - Opening Doc impossible", {
      sentry: true,
      error,
    });
    throw error;
  }

  await doc.renderAsync(docValues);
  return doc.getZip().generate({ type: "nodebuffer" });
}
