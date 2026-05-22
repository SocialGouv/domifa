import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { OtpErrorCode, OtpPromptOptions, OtpPromptResult } from "../otp.types";

@Injectable({ providedIn: "root" })
export class OtpPromptService {
  private readonly currentPrompt = new BehaviorSubject<OtpPromptOptions | null>(
    null
  );
  private readonly submittingSubject = new BehaviorSubject<boolean>(false);
  private results: Subject<OtpPromptResult> | null = null;

  public readonly visible$: Observable<OtpPromptOptions | null> =
    this.currentPrompt.asObservable();

  public readonly submitting$: Observable<boolean> =
    this.submittingSubject.asObservable();

  // Opens the modal and returns an observable of submit/cancel events. The
  // modal stays open across submissions: the interceptor closes it via
  // `closeSuccess()` on success, or updates the error via `updateError()` if
  // the API rejects the code.
  public prompt(options: OtpPromptOptions): Observable<OtpPromptResult> {
    if (this.results && !this.results.closed) {
      this.results.next({ kind: "cancel" });
      this.results.complete();
    }
    const subject = new Subject<OtpPromptResult>();
    this.results = subject;
    this.submittingSubject.next(false);
    this.currentPrompt.next(options);
    return subject.asObservable();
  }

  public updateError(errorCode: OtpErrorCode): void {
    const current = this.currentPrompt.value;
    if (!current) {
      return;
    }
    this.submittingSubject.next(false);
    this.currentPrompt.next({ ...current, previousErrorCode: errorCode });
  }

  // Resend ack: clear any prior error message (the user just received a
  // fresh code, so any "OTP_INVALID" hint from a previous attempt is stale)
  // and reset the submitting flag so the form is usable again.
  public markResent(): void {
    const current = this.currentPrompt.value;
    if (!current) {
      return;
    }
    this.submittingSubject.next(false);
    this.currentPrompt.next({ ...current, previousErrorCode: undefined });
  }

  public setSubmitting(submitting: boolean): void {
    this.submittingSubject.next(submitting);
  }

  public submit(code: string): void {
    this.results?.next({ kind: "submit", code });
  }

  public resend(): void {
    this.results?.next({ kind: "resend" });
  }

  public cancel(): void {
    this.closeWith({ kind: "cancel" });
  }

  public blocked(): void {
    this.closeWith({ kind: "blocked" });
  }

  // Called by the interceptor when the retried request succeeds or fails with
  // a non-retryable error. The modal closes; any pending consumer of the
  // observable completes.
  public closeSuccess(): void {
    this.submittingSubject.next(false);
    this.currentPrompt.next(null);
    this.results?.complete();
    this.results = null;
  }

  private closeWith(result: OtpPromptResult): void {
    this.submittingSubject.next(false);
    this.currentPrompt.next(null);
    const subject = this.results;
    this.results = null;
    subject?.next(result);
    subject?.complete();
  }
}
