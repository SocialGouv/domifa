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
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(
    public notifService: ToastrService,
    public authService: AuthService,
    public router: Router
  ) {}

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
            errorMessage = { message: `Error: ${error.error.message}` };
          } else {
            if (error.status === 401) {
              this.exit();
              return;
            }
            const message =
              typeof error.error.message !== "undefined"
                ? error.error.message
                : error.message;
            errorMessage = { status: error.status, message };
          }
          return throwError(errorMessage);
        }
      })
    );
  }

  private exit() {
    this.authService.logout();

    this.router.navigate(["/connexion"], {
      queryParams: {
        returnUrl: this.router.routerState.snapshot.url,
      },
    });
  }
}
