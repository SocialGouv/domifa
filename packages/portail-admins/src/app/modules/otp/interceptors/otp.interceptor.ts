/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EMPTY, from, Observable, throwError } from "rxjs";
import { catchError, finalize, switchMap, tap } from "rxjs/operators";
import { OtpPromptService } from "../services/otp-prompt.service";
import { OtpErrorBody, OtpErrorCode } from "../otp.types";
import { CustomToastService } from "../../shared/services/custom-toast.service";

const OTP_CODE_HEADER = "Otp-Code";

const OTP_BLOCKED_TOAST =
  "Le code n'a pas pu être validé. Veuillez réessayer plus tard et demander un nouveau code.";

@Injectable()
export class OtpInterceptor implements HttpInterceptor {
  constructor(
    private readonly promptService: OtpPromptService,
    private readonly toastr: CustomToastService
  ) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: unknown) => {
        if (!(error instanceof HttpErrorResponse)) {
          return throwError(() => error);
        }
        return from(this.normalizeError(error)).pipe(
          switchMap((normalized) => {
            const code = this.extractOtpCode(normalized);
            if (!code) {
              return throwError(() => normalized);
            }
            if (code === "OTP_BLOCKED" || code === "OTP_RESEND_LIMIT") {
              return this.failBlocked();
            }
            return this.promptAndRetry(request, next, code);
          })
        );
      })
    );
  }

  private failBlocked(): Observable<never> {
    this.toastr.error(OTP_BLOCKED_TOAST);
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 400,
          error: { code: "OTP_FAILED" },
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

  // Requests with `responseType: 'blob'` surface error bodies as a Blob. Parse
  // it as JSON so `extractOtpCode` can read `{ code: ... }` consistently across
  // export downloads and regular API calls.
  private async normalizeError(
    error: HttpErrorResponse
  ): Promise<HttpErrorResponse> {
    if (!(error.error instanceof Blob)) {
      return error;
    }
    try {
      const text = await error.error.text();
      const parsed = text ? JSON.parse(text) : null;
      return new HttpErrorResponse({
        status: error.status,
        statusText: error.statusText,
        headers: error.headers,
        url: error.url ?? undefined,
        error: parsed,
      });
    } catch {
      return error;
    }
  }

  private promptAndRetry(
    request: HttpRequest<any>,
    next: HttpHandler,
    previousErrorCode: OtpErrorCode
  ): Observable<HttpEvent<any>> {
    return this.promptService
      .prompt({
        purpose: "EXPORT",
        previousErrorCode:
          previousErrorCode === "OTP_REQUIRED" ? undefined : previousErrorCode,
      })
      .pipe(
        switchMap((result) => {
          if (result.kind === "cancel") {
            // Not 401: cancelling the OTP prompt is a user action, not an
            // auth failure. A 401 would be caught by ServerErrorInterceptor
            // and force a logout.
            return throwError(
              () =>
                new HttpErrorResponse({
                  status: 400,
                  error: { code: "OTP_CANCELLED" },
                })
            );
          }
          if (result.kind === "blocked") {
            return this.failBlocked();
          }
          const retried = request.clone({
            setHeaders: { [OTP_CODE_HEADER]: result.code },
          });
          this.promptService.setSubmitting(true);
          return next.handle(retried).pipe(
            finalize(() => this.promptService.setSubmitting(false)),
            tap({
              next: (event) => {
                if (event.type === HttpEventType.Response) {
                  this.promptService.closeSuccess();
                  this.toastr.success("Code validé");
                }
              },
            }),
            catchError((error: unknown) => {
              if (!(error instanceof HttpErrorResponse)) {
                this.promptService.closeSuccess();
                return throwError(() => error);
              }
              return from(this.normalizeError(error)).pipe(
                switchMap((normalized) => {
                  const otpCode = this.extractOtpCode(normalized);
                  if (otpCode === "OTP_INVALID" || otpCode === "OTP_REQUIRED") {
                    // Keep modal open, show error, wait for next submission.
                    this.promptService.updateError("OTP_INVALID");
                    return EMPTY;
                  }
                  if (
                    otpCode === "OTP_BLOCKED" ||
                    otpCode === "OTP_RESEND_LIMIT"
                  ) {
                    this.promptService.closeSuccess();
                    return this.failBlocked();
                  }
                  this.promptService.closeSuccess();
                  return throwError(() => normalized);
                })
              );
            })
          );
        })
      );
  }
}
