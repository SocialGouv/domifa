import {
  Transform,
  TransformFnParams,
  TransformOptions,
} from "class-transformer";

export function LowerCaseTransform(
  transformOptions?: TransformOptions
): (target: any, key: string) => void {
  return Transform((sourceData: TransformFnParams) => {
    if ("string" !== typeof sourceData.value) {
      return null;
    }
    return sourceData.value.toLowerCase();
  }, transformOptions);
}
