import { ErrorHandler, Injectable } from "@angular/core";

import * as Sentry from "@sentry/browser";

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError(err: any): void {
    Sentry.captureException(new Error(err));
  }
}
