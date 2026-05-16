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
import { OtpPromptService } from "../../services/otp-prompt.service";
import { OtpErrorCode, OtpPromptOptions } from "../../otp.types";

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
  public errorCode: OtpErrorCode | null = null;
  public attemptCount = 0;

  public static readonly MAX_ATTEMPTS = 3;

  private readonly subscription = new Subscription();
  private isOpen = false;
  private unlistenCancel: (() => void) | null = null;

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
    // Block the native <dialog> Escape behavior. The dialog fires a cancelable
    // `cancel` event before closing; preventing it keeps the modal open until
    // the user clicks Annuler.
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

  public cancel(): void {
    this.promptService.cancel();
  }

  public onConceal(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.promptService.cancel();
    }
  }

  public get isLocked(): boolean {
    return this.attemptCount >= OtpModalComponent.MAX_ATTEMPTS;
  }

  public get errorMessage(): string | null {
    if (this.isLocked) {
      return "Trop de tentatives. Veuillez réessayer plus tard.";
    }
    switch (this.errorCode) {
      case "OTP_INVALID":
        return "Code incorrect. Veuillez ressaisir le code.";
      case "OTP_BLOCKED":
        return "Trop de tentatives. Réessayez dans une heure.";
      case "OTP_RESEND_LIMIT":
        return "Limite de renvois atteinte. Veuillez attendre l'expiration du code.";
      default:
        return null;
    }
  }

  private openWith(options: OtpPromptOptions): void {
    if (options.previousErrorCode === "OTP_INVALID") {
      this.attemptCount += 1;
    } else if (!options.previousErrorCode) {
      this.attemptCount = 0;
    }

    if (this.attemptCount >= OtpModalComponent.MAX_ATTEMPTS) {
      this.promptService.blocked();
      return;
    }

    this.errorCode = options.previousErrorCode ?? null;
    this.submitted = false;
    this.codeControl.reset("");
    if (!this.isOpen) {
      this.otpModal.open();
      this.isOpen = true;
    }
    this.cdr.markForCheck();
    // DSFR injects a "Fermer" close button at the top of the modal which the
    // native <dialog> auto-focuses on open. Override that so the user lands
    // directly on the OTP input — pressing Enter on the close button would
    // cancel the prompt and trigger a fresh OTP cycle on the next attempt.
    setTimeout(() => this.otpCodeInput?.nativeElement.focus(), 50);
  }

  private closeQuiet(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.otpModal?.close();
    }
  }
}
