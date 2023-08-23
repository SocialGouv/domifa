/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from "../modules/shared/services/auth.service";
import { captureException } from "@sentry/angular";

@Injectable({
  providedIn: "root",
})
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthService) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          captureException(error.error);
          return throwError(() => error.error);
        } else if (error instanceof HttpErrorResponse) {
          if (error.status === 401 || error.status === 403) {
            this.authService.logoutAndRedirect(undefined, true);
          } else {
            captureException(error);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
