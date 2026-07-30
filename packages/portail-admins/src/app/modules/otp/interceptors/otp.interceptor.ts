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
import {
  ApiMessage,
  isOtpErrorCode,
  OTP_ERROR_LABELS,
  OtpErrorCode,
} from "@domifa/common";
import { OtpPromptService } from "../services/otp-prompt.service";
import { CustomToastService } from "../../shared/services/custom-toast.service";

const OTP_CODE_HEADER = "Otp-Code";

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
            const code = this.extractOtpErrorCode(normalized);
            if (!code) {
              return throwError(() => normalized);
            }
            if (isTerminal(code)) {
              return this.failTerminal(code);
            }
            return this.promptAndRetry(request, next, code);
          })
        );
      })
    );
  }

  private failTerminal(code: OtpErrorCode): Observable<never> {
    this.toastr.error(OTP_ERROR_LABELS[code]);
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 400,
          error: { message: "OTP_FAILED" },
        })
    );
  }

  private extractOtpErrorCode(error: HttpErrorResponse): OtpErrorCode | null {
    if (error.status !== 401 && error.status !== 429) return null;
    const body = error.error as ApiMessage | undefined;
    return isOtpErrorCode(body?.message) ? body.message : null;
  }

  // Requests with `responseType: 'blob'` surface error bodies as a Blob. Parse
  // it as JSON so `extractOtpErrorCode` can read `{ message }` consistently across
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
                  error: { message: "OTP_CANCELLED" },
                })
            );
          }
          if (result.kind === "blocked") {
            return this.failTerminal("OTP_SCOPE_LOCKED");
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
                  const otpCode = this.extractOtpErrorCode(normalized);
                  if (!otpCode) {
                    this.promptService.closeSuccess();
                    return throwError(() => normalized);
                  }
                  if (isTerminal(otpCode)) {
                    this.promptService.closeSuccess();
                    return this.failTerminal(otpCode);
                  }
                  // Recoverable (OTP_CODE_INVALID / OTP_CODE_EXPIRED /
                  // OTP_REQUIRED): keep the modal open, show error.
                  this.promptService.updateError(otpCode);
                  return EMPTY;
                })
              );
            })
          );
        })
      );
  }
}

// Terminal = user can't recover in this modal (must wait / re-trigger).
function isTerminal(code: OtpErrorCode): boolean {
  return code === "OTP_SCOPE_LOCKED" || code === "OTP_USER_RATE_LIMITED";
}
