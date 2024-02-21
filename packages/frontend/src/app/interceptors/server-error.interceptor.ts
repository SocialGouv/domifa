/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";

import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from "../modules/shared/services/auth.service";
import { captureException } from "@sentry/angular-ivy";
import { CustomToastService } from "../modules/shared/services";
import { Router } from "@angular/router";

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

    return next.handle(request).pipe(
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
          if (error.status === 401 || error.status === 403) {
            authService.logoutAndRedirect(undefined, true);
          } else if (error.status === 404) {
            toastr.error("La page que vous recherchez n'existe pas");
            router.navigate(["404"]);
          } else {
            captureException(error);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
