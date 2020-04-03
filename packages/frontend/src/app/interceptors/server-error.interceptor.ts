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

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = "";
        errorMessage =
          error.error instanceof ErrorEvent
            ? `FRONT ERROR : ${error.error.message}`
            : `API ERROR Code: ${error.status}\nMessage: ${error.message}`;

        return throwError({ errorMessage, error });
      })
    );
  }
}
