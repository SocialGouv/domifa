/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";

import { Observable, throwError, timer } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { AuthService } from "../modules/shared/services/auth.service";
import { captureException, getCurrentScope } from "@sentry/angular";
import { CustomToastService } from "../modules/shared/services";
import { Router } from "@angular/router";

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;
const ERROR_STATUS_CODES_TO_RETRY = [0, 408, 409, 444, 502, 503, 504, 520];

@Injectable({
  providedIn: "root",
})
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(private readonly injector: Injector) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authService = this.injector.get(AuthService);
    const toastr = this.injector.get(CustomToastService);
    const router = this.injector.get(Router);

    if (authService?.currentUserValue) {
      const user = authService.currentUserValue;
      getCurrentScope().setTag("structure", user?.structureId?.toString());
      getCurrentScope().setUser({
        email: user.email,
        username: `STRUCTURE ${user?.structureId?.toString()} : ${
          user?.prenom
        }`,
      });
    }

    return next.handle(request).pipe(
      retry({
        count: MAX_RETRIES,
        delay: (error, retryCount) => {
          if (this.isRetryable(error)) {
            console.log(error);
            console.log(`Tentative de nouvelle requête ${retryCount}`);
            return timer(RETRY_DELAY);
          }
          return throwError(() => error);
        },
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          if (!navigator.onLine) {
            toastr.error(
              "Vous êtes actuellement hors-ligne. Veuillez vérifier votre connexion internet"
            );
            return throwError(() => "NAVIGATOR_OFFLINE");
          }
          return throwError(() => error.error);
        } else if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            console.warn("Erreur de connexion:", error.message);
            toastr.error(
              "Problème de connexion au serveur. Veuillez réessayer plus tard."
            );
          }
          if (error.status === 401) {
            authService.logoutAndRedirect(undefined, true);
          } else if (error.status === 404) {
            toastr.error("La page que vous recherchez n'existe pas");
            router.navigate(["404"]);
          } else {
            toastr.error(
              "Une erreur serveur est survenue. Nos équipes ont été notifiées."
            );
          }
        }
        this.logError(request, error);
        return throwError(() => error);
      })
    );
  }

  private isRetryable(error: HttpErrorResponse): boolean {
    return !error.status || ERROR_STATUS_CODES_TO_RETRY.includes(error.status);
  }

  private logError(request: HttpRequest<any>, error: HttpErrorResponse): void {
    console.warn(error.message, {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error,
      request,
    });
    captureException(error, { data: request });
  }
}
