import {
  Transform,
  TransformFnParams,
  TransformOptions,
} from "class-transformer";
import striptags = require("striptags");
import escapeHtml = require("escape-html");

export function StripTagsTransform(
  transformOptions?: TransformOptions
): (target: any, key: string) => void {
  return Transform((sourceData: TransformFnParams) => {
    if ("string" !== typeof sourceData.value) {
      return null;
    }
    if (sourceData.value.trim() === "") {
      return null;
    }
    return escapeHtml(striptags(sourceData.value));
  }, transformOptions);
}
