import { Writable } from "node:stream";
import { AxiosError, AxiosHeaders } from "axios";
import { pino } from "pino";
import {
  pinoOptions,
  redactLogValue,
  redactLogValues,
  redactSensitiveUrl,
  serializeBody,
  serializeError,
} from "./AppLogger.service";

const buildAxiosError = (): AxiosError => {
  const config = {
    method: "post",
    url: "https://api.example.com/v3/smtp/email?destinationAddress=0600000000",
    headers: new AxiosHeaders({ "api-key": "xkeysib-SECRET" }),
    data: JSON.stringify({ params: { code: "424242" } }),
  };
  return new AxiosError(
    "Request failed with status code 400",
    "ERR_BAD_REQUEST",
    config,
    {},
    {
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config,
      data: { message: "invalid" },
    }
  );
};

const captureLogLine = (write: (logger: pino.Logger) => void): string => {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });
  write(pino(pinoOptions, stream));
  return chunks.join("");
};

describe("AppLogger", () => {
  describe("serializeError", () => {
    it("should keep only safe fields of an axios error", () => {
      const serialized = serializeError(buildAxiosError());

      expect(serialized).toEqual({
        type: "AxiosError",
        message: "Request failed with status code 400",
        code: "ERR_BAD_REQUEST",
        status: 400,
        method: "post",
        url: "https://api.example.com/v3/smtp/email",
        stack: expect.any(String),
      });
      const json = JSON.stringify(serialized);
      expect(json).not.toContain("xkeysib-SECRET");
      expect(json).not.toContain("424242");
      expect(json).not.toContain("0600000000");
    });

    it("should use the standard serializer for other errors", () => {
      const serialized = serializeError(new Error("boom")) as {
        type: string;
        message: string;
      };

      expect(serialized.type).toBe("Error");
      expect(serialized.message).toBe("boom");
    });
  });

  describe("redactSensitiveUrl", () => {
    it.each([
      [
        "/users/check-password-token/42/abcdef123",
        "/users/check-password-token/42/[REDACTED]",
      ],
      [
        "/users-supervisor/check-password-token/42/abcdef123?x=1",
        "/users-supervisor/check-password-token/42/[REDACTED]?x=1",
      ],
      [
        "/users/confirm-email-update/0d5a-uuid/abcdef123",
        "/users/confirm-email-update/0d5a-uuid/[REDACTED]",
      ],
      [
        "https://domifa.test/users/reset-password/42/abcdef123",
        "https://domifa.test/users/reset-password/42/[REDACTED]",
      ],
      [
        "https://admin.domifa.test/structures/enable/0d5a-uuid/abcdef123",
        "https://admin.domifa.test/structures/enable/0d5a-uuid/[REDACTED]",
      ],
      ["/usagers/12/rdv", "/usagers/12/rdv"],
    ])("%s", (url, expected) => {
      expect(redactSensitiveUrl(url)).toBe(expected);
    });
  });

  describe("redactLogValue", () => {
    it.each([
      ["Jean-Pierre d'Arc", "[REDACTED]"],
      ["Rendez-vous le 12/03, appeler avant", "[REDACTED]"],
      ["' OR 1=1 --", "[REDACTED:SUSPICIOUS]"],
      ["x' and sleep(5)", "[REDACTED:SUSPICIOUS]"],
      ["<script>alert(1)</script>", "[REDACTED:SUSPICIOUS]"],
      ["${jndi:ldap://x}", "[REDACTED:SUSPICIOUS]"],
      ["{{7*7}}", "[REDACTED:SUSPICIOUS]"],
      ["../../etc/passwd", "[REDACTED:SUSPICIOUS]"],
      ["1 UNION ALL SELECT password FROM users", "[REDACTED:SUSPICIOUS]"],
      ["[REDACTED:SUSPICIOUS]", "[REDACTED:SUSPICIOUS]"],
    ])("%s", (value, expected) => {
      expect(redactLogValue(value)).toBe(expected);
    });

    it("should expose the type of a non-string value", () => {
      expect(redactLogValue({ $gt: "" })).toBe("[REDACTED:object]");
      expect(redactLogValue(["a"])).toBe("[REDACTED:array]");
      expect(redactLogValue(42)).toBe("[REDACTED:number]");
      expect(redactLogValue(null)).toBe("[REDACTED]");
    });
  });

  describe("redactLogValues", () => {
    it("should truncate long strings, long arrays and deep objects", () => {
      const deep = {
        a: { b: { c: { d: { e: { f: { g: { h: { i: 1 } } } } } } } },
      };

      expect(
        redactLogValues({
          long: "x".repeat(600),
          list: Array.from({ length: 25 }, (_, index) => index),
          deep,
        })
      ).toEqual({
        long: `${"x".repeat(512)}[TRUNCATED]`,
        list: [
          ...Array.from({ length: 20 }, (_, index) => index),
          "[+5 items]",
        ],
        deep: { a: { b: { c: { d: { e: { f: { g: "[TRUNCATED]" } } } } } } },
      });
    });
  });

  describe("serializeBody", () => {
    it("should skip empty and non-object bodies", () => {
      expect(serializeBody(undefined)).toBeUndefined();
      expect(serializeBody({})).toBeUndefined();
      expect(serializeBody("raw")).toBeUndefined();
      expect(serializeBody(Buffer.from("raw"))).toBe("[BINARY BODY]");
    });
  });

  describe("pino output", () => {
    it("should not leak axios error details", () => {
      const line = captureLogLine((logger) =>
        logger.error({ err: buildAxiosError() }, "brevo failed")
      );

      expect(line).toContain("ERR_BAD_REQUEST");
      expect(line).not.toContain("xkeysib-SECRET");
      expect(line).not.toContain("424242");
    });

    it("should keep sanitized allowlisted headers and ignore req.body", () => {
      const line = captureLogLine((logger) =>
        logger.info(
          {
            req: {
              id: "req-1",
              method: "POST",
              url: "/users/check-password-token/42/RESET-SECRET?lang=fr",
              headers: {
                host: "api.domifa.test",
                authorization: "Bearer eyJhbGciOi.JWT-SECRET",
                cookie: "dm_trust=TRUST-SECRET",
                "otp-code": "424242",
                "user-agent": "Mozilla/5.0\r\nX-Injected: 1",
                "content-type": "x".repeat(2000),
                referer:
                  "https://domifa.test/users/reset-password/42/FRONT-SECRET",
                "x-http-method-override": "DELETE",
                "x-custom": "CUSTOM-HEADER",
              },
              body: {
                oldPassword: "OLD-SECRET",
                newPassword: "NEW-SECRET",
                passwordConfirmation: "NEW-SECRET",
              },
            },
            res: {
              statusCode: 200,
              getHeaders: () => ({ "set-cookie": "dm_trust=TRUST-SECRET" }),
            },
          },
          "http_request"
        )
      );

      const { req, res } = JSON.parse(line);
      expect(req).toEqual({
        id: "req-1",
        method: "POST",
        url: "/users/check-password-token/42/[REDACTED]?lang=fr",
        headers: {
          host: "api.domifa.test",
          authorization: "Bearer eyJ-REDACTED",
          "user-agent": "Mozilla/5.0X-Injected: 1",
          "content-type": "x".repeat(512),
          referer: "https://domifa.test/users/reset-password/42/[REDACTED]",
          "x-http-method-override": "DELETE",
        },
      });
      expect(res).toEqual({ statusCode: 200 });
      for (const secret of [
        "JWT-SECRET",
        "TRUST-SECRET",
        "RESET-SECRET",
        "FRONT-SECRET",
        "OLD-SECRET",
        "NEW-SECRET",
        "424242",
        "CUSTOM-HEADER",
      ]) {
        expect(line).not.toContain(secret);
      }
    });

    it("should log the body content without personal data nor secrets", () => {
      const line = captureLogLine((logger) =>
        logger.info(
          {
            body: {
              nom: "Dupont",
              prenom: "Jean",
              dateNaissance: "1980-01-01",
              telephone: { countryCode: "fr", numero: "0600000000" },
              typeDom: "PREMIERE_DOM",
              entretien: {
                commentaires: "Situation difficile",
                causeDetail: "Perte emploi",
                revenus: true,
              },
              ayantsDroits: [
                { nom: "Dupont", prenom: "Marie", lien: "ENFANT" },
              ],
              password: "' OR 1=1 --",
              email: "<script>alert(1)</script>",
              login: { $gt: "" },
            },
          },
          "http_request"
        )
      );

      expect(JSON.parse(line).body).toEqual({
        nom: "[REDACTED]",
        prenom: "[REDACTED]",
        dateNaissance: "[REDACTED]",
        telephone: { countryCode: "[REDACTED]", numero: "[REDACTED]" },
        typeDom: "PREMIERE_DOM",
        entretien: {
          commentaires: "[REDACTED]",
          causeDetail: "[REDACTED]",
          revenus: true,
        },
        ayantsDroits: [
          { nom: "[REDACTED]", prenom: "[REDACTED]", lien: "ENFANT" },
        ],
        password: "[REDACTED:SUSPICIOUS]",
        email: "[REDACTED:SUSPICIOUS]",
        login: { $gt: "[REDACTED]" },
      });
      expect(line).not.toMatch(
        /Dupont|Jean|Marie|0600000000|Situation difficile|Perte emploi|1=1|script/
      );
    });

    it("should omit an empty body", () => {
      const line = captureLogLine((logger) =>
        logger.info({ body: {} }, "http_request")
      );

      expect(JSON.parse(line)).not.toHaveProperty("body");
    });

    it("should flag suspicious values in a redacted log context", () => {
      const line = captureLogLine((logger) =>
        logger.warn(
          { password: "' OR 1=1 --", dto: { token: "TOKEN-SECRET" } },
          "manual log"
        )
      );

      const parsed = JSON.parse(line);
      expect(parsed.password).toBe("[REDACTED:SUSPICIOUS]");
      expect(parsed.dto.token).toBe("[REDACTED]");
    });

    it("should redact sensitive fields passed in a log context", () => {
      const line = captureLogLine((logger) =>
        logger.warn(
          {
            password: "PWD-SECRET",
            dto: {
              oldPassword: "OLD-SECRET",
              newPassword: "NEW-SECRET",
              passwordConfirmation: "NEW-SECRET",
              trustToken: "TRUST-SECRET",
              otpCode: "424242",
            },
          },
          "manual log"
        )
      );

      expect(line).not.toMatch(
        /PWD-SECRET|OLD-SECRET|NEW-SECRET|TRUST-SECRET|424242/
      );
    });
  });
});
