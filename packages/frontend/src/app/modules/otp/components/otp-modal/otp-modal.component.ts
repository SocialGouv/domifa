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
  public resendDisabled = false;
  public resendCooldown = 0;

  public static readonly MAX_ATTEMPTS = 3;
  public static readonly RESEND_COOLDOWN_SECONDS = 60;

  private readonly subscription = new Subscription();
  private isOpen = false;
  private unlistenCancel: (() => void) | null = null;
  private resendTimer: ReturnType<typeof setInterval> | null = null;

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

  public cancel(): void {
    this.promptService.cancel();
  }

  public resend(): void {
    if (this.resendDisabled || this.submitting || this.resendCooldown > 0) {
      return;
    }
    // Reset the local form state so the user can type the new code as soon
    // as it arrives. We don't clear `attemptCount` — wrong-code attempts on
    // the previous code stay on the lockout meter (matches backend behavior
    // where `attempts` is not reset across resends).
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
    }

    if (this.attemptCount >= OtpModalComponent.MAX_ATTEMPTS) {
      this.promptService.blocked();
      return;
    }

    // Reset par-saisie : on vide le champ et l'état "submitted" à chaque
    // (ré)ouverture, y compris entre retries (le compteur d'attempts persiste
    // lui pendant la session courante, et est remis à 0 par closeQuiet quand
    // la modale se ferme).
    this.errorCode = options.previousErrorCode ?? null;
    // Le backend retourne OTP_RESEND_LIMIT quand on a épuisé les renvois sur
    // l'OTP actif. À ce stade le seul recours est d'attendre l'expiration
    // (30 min) ou de valider le dernier code reçu — on grise le bouton.
    if (options.previousErrorCode === "OTP_RESEND_LIMIT") {
      this.resendDisabled = true;
    }
    this.submitted = false;
    this.codeControl.reset("");
    if (!this.isOpen) {
      this.otpModal.open();
      this.isOpen = true;
      this.startResendCooldown();
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
    this.resetState();
  }

  // Cleanup complet à la fermeture de session : garantit que la prochaine
  // ouverture démarre à zéro, sans dépendre du chemin emprunté par le caller
  // (cancel, blocked, success). Appelé via closeQuiet quand currentPrompt
  // émet null — pas pendant les retries (updateError ne déclenche pas null).
  private resetState(): void {
    this.attemptCount = 0;
    this.submitted = false;
    this.errorCode = null;
    this.resendDisabled = false;
    this.codeControl.reset("");
    this.clearResendTimer();
    this.resendCooldown = 0;
    this.cdr.markForCheck();
  }

  private startResendCooldown(): void {
    this.clearResendTimer();
    this.resendCooldown = OtpModalComponent.RESEND_COOLDOWN_SECONDS;
    this.resendTimer = setInterval(() => {
      this.resendCooldown -= 1;
      if (this.resendCooldown <= 0) {
        this.clearResendTimer();
      }
      this.cdr.markForCheck();
    }, 1000);
  }

  private clearResendTimer(): void {
    if (this.resendTimer !== null) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }
  }
}
