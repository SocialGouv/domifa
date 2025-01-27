import {
  Transform,
  TransformFnParams,
  TransformOptions,
} from "class-transformer";

export function UpperCaseTransform(
  transformOptions?: TransformOptions
): (target: any, key: string) => void {
  return Transform((sourceData: TransformFnParams) => {
    return sourceData.value ? sourceData.value.toString().toUpperCase() : null;
  }, transformOptions);
}
