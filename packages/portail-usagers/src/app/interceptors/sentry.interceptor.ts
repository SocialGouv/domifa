import { ErrorHandler, Injectable } from "@angular/core";

import * as Sentry from "@sentry/browser";

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    Sentry.captureException(new Error(err));
  }
}
