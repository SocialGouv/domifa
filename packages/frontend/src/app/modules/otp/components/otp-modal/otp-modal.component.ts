import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { Subscription } from "rxjs";
import {
  OTP_ERROR_LABELS,
  OTP_EXPIRATION_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_RESEND_LABEL,
  OtpErrorCode,
  buildOtpResendWaitLabel,
  OtpPromptOptions,
} from "@domifa/common";
import { OtpPromptService } from "../../services/otp-prompt.service";

@Component({
  selector: "app-otp-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DsfrModalComponent],
  templateUrl: "./otp-modal.component.html",
  styleUrl: "./otp-modal.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("otpModal", { static: true })
  public otpModal!: DsfrModalComponent;

  @ViewChild("otpCodeInput")
  public otpCodeInput?: ElementRef<HTMLInputElement>;

  public readonly codeControl = new FormControl("", {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
      Validators.pattern(/^\d{6}$/),
    ],
  });

  public submitted = false;
  public submitting = false;
  public previousErrorCode: OtpErrorCode | null = null;
  public attemptCount = 0;
  public resendLocked = false;
  public resendLabel = OTP_RESEND_LABEL;
  public readonly otpExpirationMinutes = OTP_EXPIRATION_MINUTES;

  private readonly subscription = new Subscription();
  private isOpen = false;
  private unlistenCancel: (() => void) | null = null;
  private resendTimer: ReturnType<typeof setInterval> | null = null;
  private resendSecondsLeft = 0;

  constructor(
    private readonly promptService: OtpPromptService,
    private readonly cdr: ChangeDetectorRef,
    private readonly renderer: Renderer2
  ) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.promptService.visible$.subscribe((options) => {
        if (options) {
          this.openWith(options);
        } else {
          this.closeQuiet();
        }
      })
    );
    this.subscription.add(
      this.promptService.submitting$.subscribe((submitting) => {
        this.submitting = submitting;
        this.cdr.markForCheck();
      })
    );
  }

  public ngAfterViewInit(): void {
    // Block the native <dialog> Escape behavior. Preventing `cancel` keeps
    // the modal open until the user closes it from the DSFR header button.
    const dialog = this.otpModal?.dsfrModal?.nativeElement as
      | HTMLElement
      | undefined;
    if (dialog) {
      this.unlistenCancel = this.renderer.listen(
        dialog,
        "cancel",
        (event: Event) => event.preventDefault()
      );
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.unlistenCancel?.();
    this.clearResendTimer();
  }

  public onSubmit(event: Event): void {
    event.preventDefault();
    this.submit();
  }

  public submit(): void {
    if (this.isLocked || this.submitting) {
      return;
    }
    this.submitted = true;
    if (this.codeControl.invalid) {
      this.cdr.markForCheck();
      return;
    }
    this.promptService.submit(this.codeControl.value);
  }

  public resend(): void {
    if (this.submitting || this.resendLocked) {
      return;
    }
    this.submitted = false;
    this.codeControl.reset("");
    this.startResendCooldown();
    this.cdr.markForCheck();
    this.promptService.resend();
  }

  public onConceal(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.promptService.cancel();
    }
  }

  public get isLocked(): boolean {
    return this.attemptCount >= OTP_MAX_ATTEMPTS;
  }

  public get errorMessage(): string | null {
    if (this.isLocked) {
      return OTP_ERROR_LABELS.OTP_SCOPE_LOCKED;
    }
    return this.previousErrorCode
      ? OTP_ERROR_LABELS[this.previousErrorCode]
      : null;
  }

  private openWith(options: OtpPromptOptions): void {
    if (options.previousErrorCode === "OTP_CODE_INVALID") {
      this.attemptCount += 1;
    }

    if (this.attemptCount >= OTP_MAX_ATTEMPTS) {
      this.promptService.blocked();
      return;
    }

    this.previousErrorCode = options.previousErrorCode ?? null;
    this.submitted = false;
    this.codeControl.reset("");
    if (!this.isOpen) {
      this.otpModal.open();
      this.isOpen = true;
      this.startResendCooldown();
    }
    this.cdr.markForCheck();
    // DSFR auto-focuses its close button on open; override so Enter validates
    // the code instead of cancelling the prompt.
    setTimeout(() => this.otpCodeInput?.nativeElement.focus(), 50);
  }

  private closeQuiet(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.otpModal?.close();
    }
    this.resetState();
  }

  private resetState(): void {
    this.attemptCount = 0;
    this.submitted = false;
    this.previousErrorCode = null;
    this.codeControl.reset("");
    this.clearResendTimer();
    this.resendLocked = false;
    this.resendLabel = OTP_RESEND_LABEL;
    this.cdr.markForCheck();
  }

  private startResendCooldown(): void {
    this.clearResendTimer();
    this.resendLocked = true;
    this.resendSecondsLeft = OTP_RESEND_COOLDOWN_SECONDS;
    this.resendLabel = buildOtpResendWaitLabel(this.resendSecondsLeft);
    this.resendTimer = setInterval(() => {
      this.resendSecondsLeft -= 1;
      if (this.resendSecondsLeft <= 0) {
        this.clearResendTimer();
        this.resendLocked = false;
        this.resendLabel = OTP_RESEND_LABEL;
      } else {
        this.resendLabel = buildOtpResendWaitLabel(this.resendSecondsLeft);
      }
      this.cdr.markForCheck();
    }, 1000);
  }

  private clearResendTimer(): void {
    if (this.resendTimer !== null) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }
    this.resendSecondsLeft = 0;
  }
}
