import {
  Transform,
  TransformFnParams,
  TransformOptions,
} from "class-transformer";

export function LowerCaseTransform(
  transformOptions?: TransformOptions
): (target: any, key: string) => void {
  return Transform((sourceData: TransformFnParams) => {
    const { value } = sourceData;
    if (typeof value !== "string") {
      return value;
    }
    return value === "" ? null : value.toLowerCase();
  }, transformOptions);
}
