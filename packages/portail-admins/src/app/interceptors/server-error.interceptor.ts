import { CustomToastService } from "./../modules/shared/services/custom-toast.service";
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
import { AdminAuthService } from "../modules/admin-auth/services/admin-auth.service";

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

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Erreur côté navigateur
        if (error.error instanceof ErrorEvent) {
          if (!navigator.onLine) {
            toastr.error(
              "Vous êtes actuellement hors-ligne. Veuillez vérifier votre connexion internet"
            );
            return throwError(() => "NAVIGATOR_OFFLINE");
          }
          // Erreur inconnue côté front
          return throwError(() => error.error);
        }

        // Erreur issue de l'API
        if (error instanceof HttpErrorResponse) {
          switch (error.status) {
            case 401:
              authService.logoutAndRedirect();
              break;
            case 403:
              authService.notAuthorized();
              break;
            default:
              break;
          }
        }
        return throwError(() => error);
      })
    );
  }
}
