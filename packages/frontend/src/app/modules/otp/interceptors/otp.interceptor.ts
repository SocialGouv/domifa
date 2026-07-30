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
  isOtpLockoutError,
  OTP_ERROR_LABELS,
  OtpErrorCode,
} from "@domifa/common";
import { OtpPromptService } from "../services/otp-prompt.service";
import { CustomToastService } from "../../shared/services";

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
            if (isOtpLockoutError(code)) {
              return this.showErrorAndAbort(code);
            }
            return this.promptAndRetry(request, next, code);
          })
        );
      })
    );
  }

  private showErrorAndAbort(code: OtpErrorCode): Observable<never> {
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
    if (error.status !== 401 && error.status !== 429) {
      return null;
    }
    const body = error.error as ApiMessage | undefined;
    return isOtpErrorCode(body?.message) ? body.message : null;
  }

  // Requests with `responseType: 'blob'` surface error bodies as a Blob. Parse
  // it as JSON so extractOtpErrorCode can read `{ message }` consistently across
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
    initialCode: OtpErrorCode
  ): Observable<HttpEvent<any>> {
    return this.promptService
      .prompt({
        purpose: "RESET_USAGERS",
        previousErrorCode:
          initialCode === "OTP_REQUIRED" ? undefined : initialCode,
      })
      .pipe(
        switchMap((result) => {
          if (result.kind === "cancel") {
            return throwError(
              () =>
                new HttpErrorResponse({
                  status: 400,
                  error: { message: "OTP_CANCELLED" },
                })
            );
          }
          if (result.kind === "blocked") {
            return this.showErrorAndAbort("OTP_SCOPE_LOCKED");
          }
          if (result.kind === "resend") {
            return this.fireResend(request, next);
          }
          return this.fireSubmit(request, next, result.code);
        })
      );
  }

  // Re-fire the original request WITHOUT the Otp-Code header. The backend
  // reuses the active OTP (no new email) or issues a fresh one if the previous
  // expired. Either way it re-throws OTP_REQUIRED, which we surface to keep
  // the modal open with the fresh state.
  private fireResend(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const retried = request.clone({
      headers: request.headers.delete(OTP_CODE_HEADER),
    });
    return this.runOtpRetry(retried, next, {
      onRecoverable: (code) => {
        this.promptService.updateError(code);
        this.toastr.success(
          "Si votre code précédent a expiré, un nouveau vient de vous être envoyé."
        );
      },
    });
  }

  private fireSubmit(
    request: HttpRequest<any>,
    next: HttpHandler,
    code: string
  ): Observable<HttpEvent<any>> {
    const retried = request.clone({
      setHeaders: { [OTP_CODE_HEADER]: code },
    });
    return this.runOtpRetry(retried, next, {
      onSuccess: () => {
        this.promptService.closeSuccess();
        this.toastr.success("Code validé");
      },
      onRecoverable: (otpCode) => this.promptService.updateError(otpCode),
    });
  }

  private runOtpRetry(
    retried: HttpRequest<any>,
    next: HttpHandler,
    hooks: {
      onSuccess?: () => void;
      onRecoverable: (code: OtpErrorCode) => void;
    }
  ): Observable<HttpEvent<any>> {
    this.promptService.setSubmitting(true);
    return next.handle(retried).pipe(
      finalize(() => this.promptService.setSubmitting(false)),
      tap({
        next: (event) => {
          if (event.type === HttpEventType.Response) {
            hooks.onSuccess?.();
          }
        },
      }),
      catchError((error: unknown) =>
        this.handleRetryError(error, hooks.onRecoverable)
      )
    );
  }

  private handleRetryError(
    error: unknown,
    onRecoverable: (code: OtpErrorCode) => void
  ): Observable<HttpEvent<any>> {
    if (!(error instanceof HttpErrorResponse)) {
      this.promptService.closeSuccess();
      return throwError(() => error);
    }
    return from(this.normalizeError(error)).pipe(
      switchMap((normalized) => {
        const code = this.extractOtpErrorCode(normalized);
        if (!code) {
          this.promptService.closeSuccess();
          return throwError(() => normalized);
        }
        if (isOtpLockoutError(code)) {
          this.promptService.closeSuccess();
          return this.showErrorAndAbort(code);
        }
        onRecoverable(code);
        return EMPTY;
      })
    );
  }
}
