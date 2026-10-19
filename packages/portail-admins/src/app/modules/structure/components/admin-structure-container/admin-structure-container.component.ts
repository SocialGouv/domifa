import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Store } from "@ngrx/store";
import {
  DsfrButtonModule,
  DsfrButtonsGroupModule,
  DsfrModalComponent,
  DsfrModalModule,
} from "@edugouvfr/ngx-dsfr";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { HttpErrorResponse } from "@angular/common/http";
import { combineLatest, Subscription, take } from "rxjs";

import {
  getPasswordChangeStatus,
  StructureAdmin,
  SUPPORT_ATTACHMENT_DURATION_MS,
  UsersForAdminList,
} from "@domifa/common";

import {
  selectAreStructuresLoaded,
  selectStructureByUuid,
  StructuresActions,
} from "../../../shared/store/structures";
import {
  selectAllAdminUsers,
  selectAreAdminUsersLoaded,
  selectIsAdminUsersLoading,
  UsersActions,
} from "../../../shared/store/users";
import { StructureService } from "../../services/structure.service";
import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import { CustomToastService } from "../../../shared/services";

const SUPPORT_MODE_ALLOWED_EMAIL_DOMAIN = "@fabrique.social.gouv.fr";

const SUPPORT_ACTIVATION_ERRORS: Record<string, string> = {
  SUPPORT_TARGET_ACCOUNT_NOT_FOUND:
    "Aucun compte structure actif n'est associé à votre adresse email.",
  SUPPORT_TARGET_PASSWORD_EXPIRED:
    "Le mot de passe de votre compte structure a expiré (ou expirera pendant le rattachement). " +
    "Connectez-vous sur l'application structure pour le renouveler, puis réessayez.",
};

@Component({
  selector: "app-admin-structure-container",
  templateUrl: "./admin-structure-container.component.html",
  styleUrl: "./admin-structure-container.component.css",
  imports: [
    CommonModule,
    RouterModule,
    DsfrSpinnerComponent,
    DsfrModalModule,
    DsfrButtonModule,
    DsfrButtonsGroupModule,
  ],
})
export class AdminStructureContainerComponent implements OnInit, OnDestroy {
  public structure?: StructureAdmin;
  public loading = true;
  public activatingSupportSession = false;
  public checkingSupportEligibility = false;
  public supportActivationError: string | null = null;
  private readonly subscription = new Subscription();

  @ViewChild("supportSessionModal")
  public supportSessionModal!: DsfrModalComponent;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly store: Store,
    private readonly structureService: StructureService,
    private readonly adminAuthService: AdminAuthService,
    private readonly toastr: CustomToastService
  ) {}

  public get canUseSupportMode(): boolean {
    return (
      this.adminAuthService.currentUserValue?.email
        ?.toLowerCase()
        .endsWith(SUPPORT_MODE_ALLOWED_EMAIL_DOMAIN) ?? false
    );
  }

  ngOnInit(): void {
    const structureUuid = this.activatedRoute.snapshot.params["structureUuid"];

    this.store
      .select(selectAreStructuresLoaded)
      .pipe(take(1))
      .subscribe((loaded) => {
        if (!loaded) {
          this.store.dispatch(StructuresActions.load());
        }
      });

    this.subscription.add(
      this.store.select(selectStructureByUuid(structureUuid)).subscribe({
        next: (structure) => {
          this.structure = structure;
          this.loading = false;

          if (!structure) {
            this.store
              .select(selectAreStructuresLoaded)
              .pipe(take(1))
              .subscribe((loaded) => {
                if (loaded) {
                  this.router.navigate(["/404"]);
                }
              });
          }
        },
      })
    );

    if (this.canUseSupportMode) {
      this.subscription.add(
        combineLatest([
          this.store.select(selectAllAdminUsers),
          this.store.select(selectIsAdminUsersLoading),
          this.store.select(selectAreAdminUsersLoaded),
        ]).subscribe(([users, loading, loaded]) => {
          this.checkingSupportEligibility = loading;
          // Not loaded (or failed): leave the decision to the server-side check.
          this.supportActivationError =
            loading || !loaded ? null : this.getSupportActivationError(users);
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public openSupportSessionModal(): void {
    // Always refetch: the admin may have just renewed their password.
    this.store.dispatch(UsersActions.load());
    this.supportSessionModal.open();
  }

  public activateSupportSession(): void {
    if (
      !this.structure ||
      this.activatingSupportSession ||
      this.checkingSupportEligibility ||
      this.supportActivationError
    ) {
      return;
    }
    this.activatingSupportSession = true;
    this.structureService
      .activateSupportSession(this.structure.uuid)
      .subscribe({
        next: (response) => {
          this.activatingSupportSession = false;
          this.supportSessionModal.close();
          const until = new Date(response.expiresAt).toLocaleTimeString(
            "fr-FR",
            { hour: "2-digit", minute: "2-digit" }
          );
          this.toastr.success(
            `Compte support rattaché à ${response.structureNom} jusqu'à ${until}. ` +
              `Il peut maintenant se connecter normalement sur l'application structure.`
          );
        },
        error: (error: HttpErrorResponse) => {
          this.activatingSupportSession = false;
          this.toastr.error(
            SUPPORT_ACTIVATION_ERRORS[error.error?.message] ??
              "Impossible de rattacher le compte support"
          );
        },
      });
  }

  private getSupportActivationError(users: UsersForAdminList[]): string | null {
    const email = this.adminAuthService.currentUserValue?.email?.toLowerCase();
    const account = users.find(
      (user) => user.status === "ACTIVE" && user.email.toLowerCase() === email
    );
    if (!account) {
      return SUPPORT_ACTIVATION_ERRORS["SUPPORT_TARGET_ACCOUNT_NOT_FOUND"];
    }

    const attachmentEnd = new Date(Date.now() + SUPPORT_ATTACHMENT_DURATION_MS);
    const passwordStatus = getPasswordChangeStatus(
      account.passwordLastUpdate,
      account.createdAt,
      attachmentEnd
    );
    if (passwordStatus === "EXPIRED") {
      return SUPPORT_ACTIVATION_ERRORS["SUPPORT_TARGET_PASSWORD_EXPIRED"];
    }
    return null;
  }
}
