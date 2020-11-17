import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../modules/shared/services/auth.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.temporaryTokens) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.temporaryTokens}`,
        },
      });
    }

    return next.handle(request);
  }
}
