import {
  Transform,
  TransformFnParams,
  TransformOptions,
} from "class-transformer";

export function TrimOrNullTransform(
  transformOptions?: TransformOptions
): (target: any, key: string) => void {
  return Transform((sourceData: TransformFnParams) => {
    if ("number" === typeof sourceData.value) {
      return sourceData.value.toString().trim();
    }
    if ("string" !== typeof sourceData.value) {
      return null;
    }
    return sourceData.value.trim() === "" ? null : sourceData.value.trim();
  }, transformOptions);
}
