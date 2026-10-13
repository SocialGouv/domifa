import { captureMessage } from "@sentry/angular";
import { PASSWORD_CHANGE_ERROR_MESSAGES } from "@domifa/common";

type ApiError = {
  status?: number;
  error?: { message?: unknown } | null;
};

// Business refusals already explained to the user: not a failure to report.
const EXPECTED_API_MESSAGES = [
  ...Object.keys(PASSWORD_CHANGE_ERROR_MESSAGES),
  "BLOCKED_TEMP",
];

// EDIT_PASSWORD_FAIL is the catch-all the API answers for any failure, wrong
// old password included: it can't be told apart from a server error here, so
// it is reported as a warning (the API reports the failing step itself).
const CATCH_ALL_API_MESSAGE = "EDIT_PASSWORD_FAIL";

// Reports an unexpected failure of the edit-my-password call to Sentry, with
// the HTTP status and the API message. Never sends form values.
export function reportPasswordChangeError(err: unknown, app: string): void {
  try {
    const { status, error } = (err ?? {}) as ApiError;
    const apiMessage =
      typeof error?.message === "string" ? error.message : undefined;

    if (apiMessage && EXPECTED_API_MESSAGES.includes(apiMessage)) {
      return;
    }

    captureMessage("[PASSWORD] edit-my-password request failed", {
      level: apiMessage === CATCH_ALL_API_MESSAGE ? "warning" : "error",
      tags: {
        app,
        httpStatus: String(status ?? "none"),
        apiMessage: apiMessage ?? "none",
      },
      extra: {
        pathname: window.location.pathname,
        online: navigator.onLine,
      },
    });
  } catch {
    // Reporting must never get in the way of the error handling.
  }
}
