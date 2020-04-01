import { ErrorHandler } from "@angular/core";
import Raven from "raven-js";
import { environment } from "src/environments/environment";

Raven.config(
  "https://5dab749719e9488798341efad0947291@sentry.fabrique.social.gouv.fr/31"
).install();

export class RavenErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    if (environment.production) {
      Raven.captureException(err);
    } else throw new Error(err);
  }
}
