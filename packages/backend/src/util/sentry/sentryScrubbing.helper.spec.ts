import { Event } from "@sentry/nestjs";
import {
  sanitizeErrorEvent,
  sanitizeSentryBreadcrumb,
  sanitizeTransactionEvent,
  scrubRequestBody,
} from "./sentryScrubbing.helper";

const buildEvent = (data: unknown): Event => ({
  request: {
    method: "POST",
    url: "https://api.domifa.test/users/check-password-token/42/RESET-SECRET?lang=fr",
    headers: {
      host: "api.domifa.test",
      authorization: "Bearer eyJhbGciOi.JWT-SECRET",
      cookie: "dm_trust=TRUST-SECRET",
      "user-agent": "Mozilla/5.0\r\nX-Injected: 1",
      "x-custom": "CUSTOM-HEADER",
    },
    cookies: { dm_trust: "TRUST-SECRET" },
    query_string: "lang=fr",
    data,
  },
});

describe("sentryScrubbing", () => {
  describe("scrubRequestBody", () => {
    it("should redact sensitive keys at any depth", () => {
      const body = JSON.stringify({
        email: "agent@domifa.test",
        oldPassword: "OLD-SECRET",
        newPassword: "NEW-SECRET",
        passwordConfirmation: "NEW-SECRET",
        nested: { trustToken: "TRUST-SECRET", label: "kept" },
        users: [{ otpCode: "424242", id: 7 }],
      });

      expect(scrubRequestBody(body)).toEqual({
        email: "agent@domifa.test",
        oldPassword: "[REDACTED]",
        newPassword: "[REDACTED]",
        passwordConfirmation: "[REDACTED]",
        nested: { trustToken: "[REDACTED]", label: "kept" },
        users: [{ otpCode: "[REDACTED]", id: 7 }],
      });
    });

    it("should drop a body that cannot be parsed", () => {
      expect(scrubRequestBody('{"password":"SECRET"')).toBe(
        "[NON JSON BODY REMOVED]"
      );
      expect(scrubRequestBody("------WebKitFormBoundary")).toBe(
        "[NON JSON BODY REMOVED]"
      );
    });

    it("should ignore an absent body", () => {
      expect(scrubRequestBody(undefined)).toBeUndefined();
      expect(scrubRequestBody(null)).toBeUndefined();
    });
  });

  describe("sanitizeErrorEvent", () => {
    it("should keep a scrubbed body and only allowlisted headers", () => {
      const event = sanitizeErrorEvent(
        buildEvent(JSON.stringify({ login: "agent", password: "PWD-SECRET" }))
      );

      expect(event.request).toEqual({
        method: "POST",
        url: "https://api.domifa.test/users/check-password-token/42/[REDACTED]",
        headers: {
          host: "api.domifa.test",
          authorization: "Bearer eyJ-REDACTED",
          "user-agent": "Mozilla/5.0X-Injected: 1",
        },
        data: { login: "agent", password: "[REDACTED]" },
      });

      const json = JSON.stringify(event);
      for (const secret of [
        "PWD-SECRET",
        "JWT-SECRET",
        "TRUST-SECRET",
        "RESET-SECRET",
        "CUSTOM-HEADER",
      ]) {
        expect(json).not.toContain(secret);
      }
    });
  });

  describe("sanitizeTransactionEvent", () => {
    it("should never keep a body", () => {
      const event = sanitizeTransactionEvent(
        buildEvent(JSON.stringify({ login: "agent", password: "PWD-SECRET" }))
      );

      expect(event.request?.data).toBeUndefined();
      const json = JSON.stringify(event);
      expect(json).not.toContain("PWD-SECRET");
      expect(json).not.toContain("login");
    });
  });

  describe("sanitizeSentryBreadcrumb", () => {
    it("should strip the query string and tokens of breadcrumb urls", () => {
      const breadcrumb = sanitizeSentryBreadcrumb({
        category: "http",
        data: {
          url: "https://api.brevo.test/v3/smtp/email?destinationAddress=0600000000",
        },
      });

      expect(breadcrumb.data?.url).toBe("https://api.brevo.test/v3/smtp/email");
    });
  });
});
