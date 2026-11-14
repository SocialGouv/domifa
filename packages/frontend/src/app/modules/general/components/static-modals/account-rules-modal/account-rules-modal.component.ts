import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { Subscription } from "rxjs";
import { UserStructure } from "@domifa/common";

import { AuthService, CustomToastService } from "../../../../shared/services";
import { SharedModule } from "../../../../shared/shared.module";
import { GENERIC_EMAIL_ACKNOWLEDGEMENT_CONTROL } from "../../../../shared/components/generic-email-acknowledgement/generic-email-acknowledgement.component";

// Existing users must acknowledge the nominative / generic email rules once.
// Support sessions never do it on behalf of the structure.
export const mustAcknowledgeAccountRules = (
  user: UserStructure | null
): boolean =>
  !!user && user.role !== "support" && !user.accountRulesAcknowledgedAt;

@Component({
  selector: "app-account-rules-modal",
  imports: [DsfrModalComponent, ReactiveFormsModule, SharedModule],
  templateUrl: "./account-rules-modal.component.html",
})
export class AccountRulesModalComponent implements OnDestroy {
  @ViewChild("accountRulesModal", { static: false })
  public accountRulesModal!: DsfrModalComponent;

  // Emitted once the modal is hidden, acknowledged or not
  @Output() public closed = new EventEmitter<void>();

  public readonly form: UntypedFormGroup;
  public submitted = false;
  public loading = false;

  private readonly subscription = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly toastService: CustomToastService,
    formBuilder: UntypedFormBuilder
  ) {
    this.form = formBuilder.group({
      [GENERIC_EMAIL_ACKNOWLEDGEMENT_CONTROL]: [false, Validators.requiredTrue],
    });
  }

  public open(): void {
    this.accountRulesModal.open();
  }

  public close(): void {
    this.accountRulesModal.close();
  }

  public submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.subscription.add(
      this.authService.acknowledgeAccountRules().subscribe({
        next: () => {
          this.loading = false;
          this.close();
        },
        error: () => {
          this.loading = false;
          this.toastService.error(
            "Une erreur est survenue, merci de réessayer"
          );
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
