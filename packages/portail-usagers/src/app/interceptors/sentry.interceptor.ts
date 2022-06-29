import { ErrorHandler, Injectable } from "@angular/core";
import { captureException } from "@sentry/angular";

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    captureException(new Error(err));
  }
}
