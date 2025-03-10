import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { appLogger } from "../../../util";

export async function validateDocTemplate(
  content: string | Buffer
): Promise<{ isValid: boolean; error?: any }> {
  try {
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { linebreaks: true });

    doc.compile();

    return { isValid: true };
  } catch (error) {
    let errorDetails = {};

    if (error.properties) {
      errorDetails = {
        message: error.properties.explanation || error.message,
        tag: error.properties.tag,
        context: error.properties.context,
        offset: error.properties.offset,
      };
    } else {
      errorDetails = {
        message: error.message,
      };
    }

    appLogger.error("DocTemplater - Invalid template", {
      sentry: true,
      error,
      errorDetails,
    });

    return { isValid: false, error: errorDetails };
  }
}
