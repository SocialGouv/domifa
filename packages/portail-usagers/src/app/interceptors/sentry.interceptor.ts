import { ErrorHandler, Injectable } from "@angular/core";
import { captureException } from "@sentry/angular-ivy";

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError(err: any): void {
    captureException(new Error(err));
  }
}
