import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { appLogger } from "../../../util";
import InspectModule from "docxtemplater/js/inspect-module.js";
import { CUSTOM_DOCS_LABELS } from "../../../_common/model";

export async function validateDocTemplate(
  content: string | Buffer
): Promise<{ isValid: boolean; error?: string }> {
  try {
    const zip = new PizZip(content);
    const iModule = new InspectModule();

    const doc = new Docxtemplater(zip, {
      modules: [iModule],
      linebreaks: true,
    });

    doc.compile();
    doc.render({});

    const tags = iModule.getAllTags();
    if (!validateCustomDocKeys(Object.keys(tags))) {
      return { isValid: false, error: "UNKNOWN_KEY" };
    }

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

    return { isValid: false, error: "TEMPLATE_ERROR" };
  }
}

export const extractTagsFromTemplate = (docxBuffer): string[] => {
  const zip = new PizZip(docxBuffer);

  const iModule = new InspectModule();

  const doc = new Docxtemplater(zip, {
    modules: [iModule],
    linebreaks: true,
    paragraphLoop: true,
  });

  doc.render({});

  const tags = iModule.getAllTags();
  return Object.keys(tags);
};

export const validateCustomDocKeys = (keys: string[]): boolean => {
  const availableKeys = Object.keys(CUSTOM_DOCS_LABELS);
  for (const key of keys) {
    if (!availableKeys.includes(key)) {
      return false;
    }
  }
  return true;
};
