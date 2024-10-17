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

    const trimmedValue = sourceData.value.trim();
    if (trimmedValue === "") {
      return null;
    }

    const sanitized = sanitizeHtml(trimmedValue);
    return striptags(sanitized)
      .replace(/[\\$~*<>{}]/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }, transformOptions);
}
