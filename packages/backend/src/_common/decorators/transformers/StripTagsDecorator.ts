import { Transform, TransformFnParams } from "class-transformer";
import striptags from "striptags";

export interface StripTagsOptions {
  multiline?: boolean;
  // Also removes INVISIBLE_CONTROL_CHARS. Opt-in: usager data deliberately
  // keeps them for now (see create-usager.dto.spec.ts).
  removeInvisibleChars?: boolean;
}

// Invisible characters that have no place in plain text: C0/C1 control
// characters (tabs and line breaks excepted, they are normalised below) and
// bidirectional overrides such as U+202E, which reverses the displayed text.
// eslint-disable-next-line no-control-regex
export const INVISIBLE_CONTROL_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

// Plain-text sanitizer shared by the DTOs and the XLSX import, for fields the
// frontends render through `{{ }}`: removes tags and NUL bytes (and invisible
// control characters on demand), normalises whitespace, nulls empty strings.
export function stripTags(
  value: string,
  { multiline = false, removeInvisibleChars = false }: StripTagsOptions = {}
): string | null {
  const withoutTags = striptags(value).replaceAll("\0", "");
  const stripped = removeInvisibleChars
    ? withoutTags.replaceAll(INVISIBLE_CONTROL_CHARS, "")
    : withoutTags;

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
