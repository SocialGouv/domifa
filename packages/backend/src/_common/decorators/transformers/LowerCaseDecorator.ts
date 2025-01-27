import {
  Transform,
  TransformFnParams,
  TransformOptions,
} from "class-transformer";

export function LowerCaseTransform(
  transformOptions?: TransformOptions
): (target: any, key: string) => void {
  return Transform((sourceData: TransformFnParams) => {
    return sourceData.value ? sourceData.value.toString().toLowerCase() : null;
  }, transformOptions);
}
