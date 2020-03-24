import { ErrorHandler } from "@angular/core";
import Raven from "raven-js";

Raven.config(
  "https://5dab749719e9488798341efad0947291@sentry.fabrique.social.gouv.fr/31"
).install();

export class RavenErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    Raven.captureException(err);
  }
}
