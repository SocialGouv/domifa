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
import { getCurrentScope } from "@sentry/angular";
import { CustomToastService } from "../modules/shared/services";
import { AdminAuthService } from "../modules/admin-auth/services/admin-auth.service";

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
    const authService = this.injector.get(AdminAuthService);
    const toastr = this.injector.get(CustomToastService);

    if (authService?.currentUserValue) {
      const user = authService.currentUserValue;

      getCurrentScope().setUser({
        email: user.email,
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
            authService.logoutAndRedirect();
            toastr.error(
              "Votre session a expiré, merci de vous connecter à nouveau"
            );
          }
        } else {
          toastr.error(
            "Une erreur serveur est survenue. Nos équipes ont été notifiées."
          );
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
  }
}
