import {
  Transform,
  TransformFnParams,
  TransformOptions,
} from "class-transformer";

import striptags from "striptags";
import sanitizeHtml from "sanitize-html";

export function StripTagsTransform(
  transformOptions?: TransformOptions
): (target: any, key: string) => void {
  return Transform((sourceData: TransformFnParams) => {
    if (typeof sourceData.value !== "string") {
      return null;
    }

    if (sourceData.value.trim() === "") {
      return null;
    }

    const sanitized = sanitizeHtml(sourceData.value);

    return striptags(sanitized)
      .replace(/[\\$~*<>{}]/gi, "")
      .replace(/\s+/g, " ");
  }, transformOptions);
}
