import { CustomToastService } from "./../modules/shared/services/custom-toast.service";
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
import { UsagerAuthService } from "../modules/usager-auth/services/usager-auth.service";

@Injectable({
  providedIn: "root",
})
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(
    private toastr: CustomToastService,
    public authService: UsagerAuthService,
  ) {}

  public intercept(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: HttpRequest<any>,
    next: HttpHandler,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Erreur côté navigateur
        if (error.error instanceof ErrorEvent) {
          if (!navigator.onLine) {
            this.toastr.error(
              "Vous êtes actuellement hors-ligne. Veuillez vérifier votre connexion internet",
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
              this.toastr.warning(
                "Votre session a expiré, merci de vous reconnecter",
              );
              this.authService.logoutAndRedirect();
              break;
            case 403:
              this.authService.notAuthorized();
              break;
            default:
              break;
          }
        }
        return throwError(() => error);
      }),
    );
  }
}
