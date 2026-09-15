import { Breadcrumb, Event, RequestEventData } from "@sentry/nestjs";
import {
  pickLoggableHeaders,
  sanitizeLogValue,
  SENTRY_HEADERS,
} from "../express";
import { redactSensitiveUrl, SECRET_KEY_PATTERN } from "../logs";

const MAX_DEPTH = 8;

export function sanitizeSentryUrl(raw: unknown): string | undefined {
  const url = sanitizeLogValue(raw);
  if (!url) {
    return undefined;
  }
  return redactSensitiveUrl(url.split("?")[0]);
}

export function scrubSensitiveValues(value: unknown, depth = 0): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (depth >= MAX_DEPTH) {
    return "[TRUNCATED]";
  }
  if (Array.isArray(value)) {
    return value.map((item) => scrubSensitiveValues(item, depth + 1));
  }
  const scrubbed: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (SECRET_KEY_PATTERN.test(key)) {
      scrubbed[key] = "[REDACTED]";
      continue;
    }
    scrubbed[key] = scrubSensitiveValues(item, depth + 1);
  }
  return scrubbed;
}

// Sentry captures the raw body as a string. Anything that is not JSON is
// dropped: multipart uploads carry usager documents, and a body over the
// capture limit arrives truncated, so it can no longer be parsed and scrubbed.
export function scrubRequestBody(data: unknown): unknown {
  if (data === undefined || data === null) {
    return undefined;
  }
  if (typeof data !== "string") {
    return scrubSensitiveValues(data);
  }
  try {
    return scrubSensitiveValues(JSON.parse(data));
  } catch {
    return "[NON JSON BODY REMOVED]";
  }
}

function sanitizeRequest(
  request: RequestEventData,
  keepBody: boolean
): RequestEventData {
  return {
    method: request.method,
    url: sanitizeSentryUrl(request.url),
    headers: pickLoggableHeaders(request.headers ?? {}, SENTRY_HEADERS),
    data: keepBody ? scrubRequestBody(request.data) : undefined,
  };
}

// Errors keep a scrubbed body: it is what makes a 500 debuggable.
export function sanitizeErrorEvent<T extends Event>(event: T): T {
  if (event.request) {
    event.request = sanitizeRequest(event.request, true);
  }
  return event;
}

// Transactions are emitted for every sampled request, error or not, so they
// never carry a body.
export function sanitizeTransactionEvent<T extends Event>(event: T): T {
  if (event.request) {
    event.request = sanitizeRequest(event.request, false);
  }
  return event;
}

export function sanitizeSentryBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  if (breadcrumb.data?.url) {
    breadcrumb.data.url = sanitizeSentryUrl(breadcrumb.data.url);
  }
  return breadcrumb;
}
