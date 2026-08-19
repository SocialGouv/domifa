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

// POST-based endpoints that only read data (search/filter/history routes
// that can't use GET because they take a filter body). Must stay in sync
// with the @AllowInSupportMode() routes on the backend — see
// AppUserGuard.guard.ts.
const ALLOWED_READ_ONLY_POST_PATTERNS = [
  /\/interactions\/search\//,
  /\/interactions\/search-login-portail\//,
  /\/usagers-notes\/search\//,
];

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
    const isAllowedReadOnlyPost = ALLOWED_READ_ONLY_POST_PATTERNS.some(
      (pattern) => pattern.test(request.url)
    );
    if (
      supportMode &&
      !SAFE_METHODS.includes(request.method) &&
      !isAllowedReadOnlyPost
    ) {
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
