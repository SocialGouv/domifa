import { Writable } from "node:stream";
import { AxiosError, AxiosHeaders } from "axios";
import { pino } from "pino";
import {
  pinoOptions,
  redactSensitiveUrl,
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
      ["/usagers/12/rdv", "/usagers/12/rdv"],
    ])("%s", (url, expected) => {
      expect(redactSensitiveUrl(url)).toBe(expected);
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

    it("should redact sensitive request headers, body fields and response cookies", () => {
      const line = captureLogLine((logger) =>
        logger.info(
          {
            req: {
              headers: {
                cookie: "dm_trust=TRUST-SECRET",
                "otp-code": "424242",
              },
            },
            res: {
              statusCode: 200,
              getHeaders: () => ({ "set-cookie": "dm_trust=TRUST-SECRET" }),
            },
            body: {
              trustToken: "TRUST-SECRET",
              otpCode: "424242",
              oldPassword: "OLD-SECRET",
              newPassword: "NEW-SECRET",
              passwordConfirmation: "NEW-SECRET",
            },
          },
          "http_request"
        )
      );

      expect(line).not.toContain("TRUST-SECRET");
      expect(line).not.toContain("424242");
      expect(line).not.toContain("OLD-SECRET");
      expect(line).not.toContain("NEW-SECRET");
    });
  });
});
