/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { from, Observable, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { OtpPromptService } from "../services/otp-prompt.service";
import { OtpErrorBody, OtpErrorCode } from "../otp.types";

const OTP_CODE_HEADER = "X-Otp-Code";

@Injectable()
export class OtpInterceptor implements HttpInterceptor {
  constructor(private readonly promptService: OtpPromptService) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: unknown) => {
        if (!(error instanceof HttpErrorResponse)) {
          return throwError(() => error);
        }
        const code = this.extractOtpCode(error);
        if (!code) {
          return throwError(() => error);
        }
        if (code === "OTP_BLOCKED" || code === "OTP_RESEND_LIMIT") {
          return throwError(() => error);
        }
        return this.promptAndRetry(request, next, code);
      })
    );
  }

  private extractOtpCode(error: HttpErrorResponse): OtpErrorCode | null {
    if (error.status !== 401 && error.status !== 429) return null;
    const body = error.error as OtpErrorBody | undefined;
    const code = body?.code;
    if (
      code === "OTP_REQUIRED" ||
      code === "OTP_INVALID" ||
      code === "OTP_BLOCKED" ||
      code === "OTP_RESEND_LIMIT"
    ) {
      return code;
    }
    return null;
  }

  private promptAndRetry(
    request: HttpRequest<any>,
    next: HttpHandler,
    previousErrorCode: OtpErrorCode
  ): Observable<HttpEvent<any>> {
    return from(
      this.promptService.prompt({
        purpose: "RESET_USAGERS",
        previousErrorCode:
          previousErrorCode === "OTP_REQUIRED" ? undefined : previousErrorCode,
      })
    ).pipe(
      switchMap((result) => {
        if (result.kind === "cancel") {
          // Not 401: cancelling the OTP prompt is a user action, not an auth
          // failure. A 401 would be caught by ServerErrorInterceptor and
          // force a logout.
          return throwError(
            () =>
              new HttpErrorResponse({
                status: 400,
                error: { code: "OTP_CANCELLED" },
              })
          );
        }
        const retried = request.clone({
          setHeaders: { [OTP_CODE_HEADER]: result.code },
        });
        return this.intercept(retried, next);
      })
    );
  }
}
