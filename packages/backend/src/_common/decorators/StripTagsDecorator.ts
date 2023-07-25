import {
  Transform,
  TransformFnParams,
  TransformOptions,
} from "class-transformer";

import striptags from "striptags";

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
    return (sourceData.value = striptags(sourceData.value)
      .replace(/[\\$~*<>{}]/gi, "")
      .replace(/\s+/g, " ")
      .trim());
  }, transformOptions);
}
