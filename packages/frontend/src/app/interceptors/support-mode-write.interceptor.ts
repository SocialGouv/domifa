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
import { AuthService } from "../modules/shared/services/auth.service";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

// Client-side safety net for support-mode read-only sessions: short-circuits
// mutating requests before they leave the browser, instead of relying only
// on the backend's 403 (which still applies as the real enforcement
// boundary — see SupportModeWriteGuard). Shaped as a genuine
// HttpErrorResponse so it flows through ServerErrorInterceptor's existing
// 403 toast, rather than duplicating that UX here.
@Injectable({ providedIn: "root" })
export class SupportModeWriteInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthService) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const supportMode = this.authService.currentUserValue?.supportMode;
    if (supportMode && !SAFE_METHODS.includes(request.method)) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 403,
            statusText: "SUPPORT_MODE_READ_ONLY",
            url: request.url,
            error: { message: "SUPPORT_MODE_READ_ONLY" },
          })
      );
    }
    return next.handle(request);
  }
}
