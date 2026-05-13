import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpModalComponent implements OnInit, OnDestroy {
  @ViewChild("otpModal", { static: true })
  public otpModal!: DsfrModalComponent;

  public readonly codeControl = new FormControl("", {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\d{6}$/)],
  });

  public submitted = false;
  public errorCode: OtpErrorCode | null = null;

  private subscription = new Subscription();

  constructor(
    private readonly promptService: OtpPromptService,
    private readonly cdr: ChangeDetectorRef
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
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public submit(): void {
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

  public get errorMessage(): string | null {
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
    this.errorCode = options.previousErrorCode ?? null;
    this.submitted = false;
    this.codeControl.reset("");
    this.otpModal.open();
    this.cdr.markForCheck();
  }

  private closeQuiet(): void {
    this.otpModal?.close();
  }
}
