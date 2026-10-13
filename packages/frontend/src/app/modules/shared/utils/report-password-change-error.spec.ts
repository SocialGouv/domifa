import * as Sentry from "@sentry/angular";

import { reportPasswordChangeError } from "./report-password-change-error";

jest.mock("@sentry/angular", () => ({
  captureMessage: jest.fn(),
}));

describe("reportPasswordChangeError", () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    "NEW_PASSWORD_SAME_AS_OLD",
    "NEW_PASSWORD_ALREADY_USED",
    "BLOCKED_TEMP",
  ])("does not report the expected refusal %s", (message) => {
    reportPasswordChangeError({ status: 400, error: { message } }, "frontend");

    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it("reports a server error at error level with status and tags", () => {
    reportPasswordChangeError({ status: 500, error: null }, "frontend");

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "[PASSWORD] edit-my-password request failed",
      expect.objectContaining({
        level: "error",
        tags: { app: "frontend", httpStatus: "500", apiMessage: "none" },
      })
    );
  });

  it("reports the catch-all EDIT_PASSWORD_FAIL as a warning", () => {
    reportPasswordChangeError(
      { status: 400, error: { message: "EDIT_PASSWORD_FAIL" } },
      "frontend"
    );

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "[PASSWORD] edit-my-password request failed",
      expect.objectContaining({
        level: "warning",
        tags: expect.objectContaining({ apiMessage: "EDIT_PASSWORD_FAIL" }),
      })
    );
  });

  it("reports a network error (no status) and never sends form values", () => {
    reportPasswordChangeError(
      { status: 0, error: { password: "Secret1!" } },
      "frontend"
    );

    const [, hint] = (Sentry.captureMessage as jest.Mock).mock.calls[0];
    expect(hint.tags.httpStatus).toBe("0");
    expect(JSON.stringify(hint)).not.toContain("Secret1!");
  });

  it("never throws, whatever the error looks like", () => {
    expect(() =>
      reportPasswordChangeError(undefined, "frontend")
    ).not.toThrow();
    expect(() => reportPasswordChangeError("boom", "frontend")).not.toThrow();
  });
});
