import { Transform, TransformFnParams } from "class-transformer";
import { parseStrictInt } from "../parse-pipes/ParseStrictInt.pipe";

// Strings that are not a plain integer are left untouched so that @IsInt rejects them
export function toStrictInt(value: unknown): unknown {
  return typeof value === "string" ? parseStrictInt(value) ?? value : value;
}

export function StrictIntTransform(): PropertyDecorator {
  return Transform(({ value }: TransformFnParams) => toStrictInt(value));
}
