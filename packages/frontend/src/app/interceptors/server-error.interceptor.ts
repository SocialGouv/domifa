import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = "";
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          if (error.status === 401) {
            this.authService.logout();
          } else if (error.status === 501) {
            this.authService.logout();
            this.router.navigate(["connexion"]);
          }
          return throwError(error);
        }
      })
    );
  }
}
