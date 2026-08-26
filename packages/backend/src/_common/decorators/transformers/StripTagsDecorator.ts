import { Transform, TransformFnParams } from "class-transformer";
import striptags from "striptags";

export interface StripTagsOptions {
  multiline?: boolean;
}

// Plain-text sanitizer shared by the DTOs and the XLSX import, for fields the
// frontends render through `{{ }}`: removes tags and NUL bytes, normalises
// whitespace, nulls empty strings.
export function stripTags(
  value: string,
  { multiline = false }: StripTagsOptions = {}
): string | null {
  const stripped = striptags(value).replaceAll("\0", "");

  const result = multiline
    ? stripped
        .replaceAll(/\r\n?/g, "\n")
        .replaceAll(/[^\S\n]+/g, " ")
        .replaceAll(/ ?\n ?/g, "\n")
        .replaceAll(/\n{3,}/g, "\n\n")
        .trim()
    : stripped.replaceAll(/\s+/g, " ").trim();

  return result === "" ? null : result;
}

// Non-string values are left untouched so that @IsString rejects them.
export function StripTagsTransform(
  options: StripTagsOptions = {}
): PropertyDecorator {
  return Transform((sourceData: TransformFnParams) =>
    typeof sourceData.value === "string"
      ? stripTags(sourceData.value, options)
      : sourceData.value
  );
}
