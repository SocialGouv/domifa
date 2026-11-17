import { escape } from "lodash";

// Direct import: the decorators barrel pulls in modules that depend on mails
import { INVISIBLE_CONTROL_CHARS } from "../../../../_common/decorators/transformers/StripTagsDecorator";

export interface BrevoSanitizeOptions {
  // HTML-escape every text value. Off until we have checked that the Brevo
  // templates do not already escape {{ params.x }}: escaping twice would break
  // the links sent by email (& -> &amp;amp;), e.g. the password reset link.
  escapeHtml: boolean;
}

// Brevo templates use a Django-like syntax: a value containing "{{" or "{%"
// must never be read as template code.
const neutralizeTemplateSyntax = (value: string): string =>
  value
    .replaceAll("{{", "{ {")
    .replaceAll("}}", "} }")
    .replaceAll("{%", "{ %")
    .replaceAll("%}", "% }");

// Text sent as a template param: line breaks are kept (multiline content)
export const sanitizeBrevoText = (
  value: string,
  { escapeHtml }: BrevoSanitizeOptions
): string => {
  const cleaned = neutralizeTemplateSyntax(
    value.replaceAll(INVISIBLE_CONTROL_CHARS, "")
  );
  return escapeHtml ? escape(cleaned) : cleaned;
};

// Text sent in an email header (subject, sender or recipient name): no line
// break may reach it, to prevent header injection
export const sanitizeBrevoHeader = (value: string): string =>
  neutralizeTemplateSyntax(
    value
      .replaceAll(INVISIBLE_CONTROL_CHARS, "")
      .replaceAll(/[\r\n\t]+/g, " ")
      .trim()
  );

// Applies sanitizeBrevoText to every string of the params, at any depth
export const sanitizeBrevoParams = <T>(
  value: T,
  options: BrevoSanitizeOptions
): T => {
  if (typeof value === "string") {
    return sanitizeBrevoText(value, options) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeBrevoParams(item, options)) as T;
  }
  if (value !== null && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sanitizeBrevoParams(item, options),
      ])
    ) as T;
  }
  return value;
};
