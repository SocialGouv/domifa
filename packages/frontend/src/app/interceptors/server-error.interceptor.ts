import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpHeaderResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, throwError, of } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { AuthService } from "../services/auth.service";
import { ToastrService } from "ngx-toastr";

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(private notifService: ToastrService) {}

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
        }
        if (error.status === 401 || error.status === 403) {
          return;
        }
        return throwError(error);
      })
    );
  }
}
