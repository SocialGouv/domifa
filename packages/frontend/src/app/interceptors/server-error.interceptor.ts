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
import { CustomToastService } from "../modules/shared/services";

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
    return next.handle(request).pipe(
      retry({
        count: MAX_RETRIES,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          if (this.shouldRetry(error)) {
            console.warn(
              `Retry attempt ${retryCount} for ${request.url}`,
              error
            );
            return timer(RETRY_DELAY);
          }
          throw error; // Pas de retry, on passe au catchError
        },
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private shouldRetry(error: HttpErrorResponse): boolean {
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
    return ERROR_STATUS_CODES_TO_RETRY.includes(error.status);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const authService = this.injector.get(AuthService);
    const toastr = this.injector.get(CustomToastService);

    if (error.error instanceof ErrorEvent) {
      if (!navigator.onLine) {
        toastr.error(
          "Vous êtes actuellement hors-ligne. Veuillez vérifier votre connexion internet"
        );
        return throwError(() => new Error("NAVIGATOR_OFFLINE"));
      }
      toastr.error("Erreur de connexion réseau");
      return throwError(() => error);
    }

    if (error.status === 0) {
      toastr.error(
        "Problème de connexion au serveur. Veuillez réessayer plus tard."
      );
    } else if (error.status === 401) {
      authService.logout(undefined, true);
    } else if (error.status === 403) {
      toastr.error("Vous n'avez pas les droits pour effectuer cette action");
    } else if (error.status >= 500 && error.status <= 504) {
      toastr.error(
        "Une erreur serveur est survenue. Nos équipes ont été notifiées."
      );
    }

    this.logError(error);
    return throwError(() => error);
  }

  private logError(error: HttpErrorResponse): void {
    console.warn("HTTP Error:", {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
    });
  }
}
