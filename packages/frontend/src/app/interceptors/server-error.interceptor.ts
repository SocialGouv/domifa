import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(public notifService: ToastrService) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!navigator.onLine) {
          this.notifService.error(
            "Vous êtes actuellement hors-ligne. Veuillez vérifier votre connexion internet"
          );
        } else {
          let errorMessage = {};
          if (error.error instanceof ErrorEvent) {
            errorMessage = {
              ...error,
              message: `Error: ${error.error.message}`,
            };
          } else {
            const message =
              typeof error.error.message !== "undefined"
                ? error.error.message
                : error.message;
            errorMessage = { ...error, status: error.status, message };
          }
          return throwError(errorMessage);
        }
        return throwError(error);
      })
    );
  }
}
