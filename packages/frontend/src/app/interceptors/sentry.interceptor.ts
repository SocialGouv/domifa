import { ErrorHandler } from "@angular/core";

import * as Sentry from "@sentry/browser";

export class SentryErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    Sentry.captureException(new Error(err));
  }
}
