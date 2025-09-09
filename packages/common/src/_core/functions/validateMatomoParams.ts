const MATOMO_PARAMS = [
  "mtm_campaign",
  "mtm_source",
  "mtm_medium",
  "mtm_content",
  "mtm_kwd",
  "utm_campaign",
  "utm_source",
  "utm_medium",
  "utm_content",
  "utm_term",
];

function sanitizeValue(value: string): string {
  return value.replace(/[^a-zA-Z0-9\-_]/g, "");
}

export function validateMatomoParam(
  key: string,
  value: unknown
): string | null {
  if (!MATOMO_PARAMS.includes(key)) {
    return null;
  }

  if (typeof value !== "string" || !value || value.length > 200) {
    return null;
  }

  const cleanValue = sanitizeValue(value);

  if (!cleanValue) {
    return null;
  }

  return cleanValue;
}

export function filterMatomoParams(
  params: Record<string, unknown>
): Record<string, string> {
  const filtered: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    const validValue = validateMatomoParam(key, value);
    if (validValue !== null) {
      filtered[key] = validValue;
    }
  });

  return filtered;
}
