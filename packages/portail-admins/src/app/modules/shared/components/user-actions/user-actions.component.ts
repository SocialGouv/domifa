import { Clipboard } from "@angular/cdk/clipboard";
import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Store } from "@ngrx/store";
import { DsfrModalComponent, DsfrModalModule } from "@edugouvfr/ngx-dsfr";
import {
  DsfrDropdownMenuComponent,
  DsfrDropdownMenuItemComponent,
} from "@edugouvfr/ngx-dsfr-ext";
import { Subscription } from "rxjs";

import {
  PortailAdminUser,
  UserSupervisor,
  UsersForAdminList,
} from "@domifa/common";

import { environment } from "../../../../../environments/environment";
import { DeleteUserComponent } from "../../../manage-users/components/delete-user/delete-user.component";
import { ManageUsersService } from "../../../manage-users/services/manage-users.service";
import { AdminUsersApiClient, CustomToastService } from "../../services";
import { UsersActions } from "../../store/users";
import { UserSessionsModalComponent } from "../user-sessions-modal/user-sessions-modal.component";
import { SessionsUserProfile } from "../user-sessions-modal/user-sessions.types";

export type UserActionsKind = "structure" | "supervisor";
type ConfirmKind = "reset-password" | "promote";

@Component({
  selector: "app-user-actions",
  templateUrl: "./user-actions.component.html",
  imports: [
    CommonModule,
    FormsModule,
    DsfrModalModule,
    DsfrDropdownMenuComponent,
    DsfrDropdownMenuItemComponent,
    DeleteUserComponent,
    UserSessionsModalComponent,
  ],
})
export class UserActionsComponent implements OnDestroy {
  @Input({ required: true }) public user!: UsersForAdminList | UserSupervisor;
  @Input({ required: true }) public userKind!: UserActionsKind;
  @Input() public me: PortailAdminUser | null = null;
  @Input() public showEdit = true;
  @Output() public readonly refresh = new EventEmitter<void>();
  @Output() public readonly editRequest = new EventEmitter<void>();

  public blockConfirmationInput = "";
  public unblockMotif = "";
  public actionLoading = false;
  public confirmKind: ConfirmKind | null = null;

  @ViewChild("confirmModal") public confirmModal?: DsfrModalComponent;
  @ViewChild("blockUserModal") public blockUserModal!: DsfrModalComponent;
  @ViewChild("unblockUserModal") public unblockUserModal!: DsfrModalComponent;
  @ViewChild("deleteUserConfirmationModal")
  public deleteUserConfirmationModal?: DsfrModalComponent;
  @ViewChild("sessionsModalCmp")
  public sessionsModalCmp?: UserSessionsModalComponent;

  public get sessionsUserType(): SessionsUserProfile {
    return this.isSupervisor ? "user_supervisor" : "user_structure";
  }

  public openSessionsModal(): void {
    this.sessionsModalCmp?.open();
  }

  private readonly subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly adminUsersApi: AdminUsersApiClient,
    private readonly manageUsersService: ManageUsersService,
    private readonly toastService: CustomToastService,
    private readonly clipboard: Clipboard
  ) {}

  // ---- Visibility flags --------------------------------------------------

  public get isStructure(): boolean {
    return this.userKind === "structure";
  }

  public get isSupervisor(): boolean {
    return this.userKind === "supervisor";
  }

  public get isSelf(): boolean {
    return !!this.me && this.me.uuid === this.user?.uuid;
  }

  // Supervisor actions are restricted to super-admin-domifa acting on someone
  // else. Structure-user actions inherit module-level access (no extra check).
  public get canManage(): boolean {
    if (this.isStructure) {
      return true;
    }
    return this.me?.role === "super-admin-domifa" && !this.isSelf;
  }

  public get canPromote(): boolean {
    return (
      this.isStructure && (this.user as UsersForAdminList).role !== "admin"
    );
  }

  public get hasResetPasswordLink(): boolean {
    return (
      this.isStructure &&
      (this.user as UsersForAdminList).temporaryTokens?.type ===
        "reset-password"
    );
  }

  public get canBlock(): boolean {
    if (!this.canManage) {
      return false;
    }
    const status = this.user?.status;
    if (this.isStructure) {
      return status === "ACTIVE" || status === "PENDING";
    }
    return (
      status === "ACTIVE" ||
      status === "PENDING" ||
      status === "TEMPORARILY_BLOCKED"
    );
  }

  public get canUnblock(): boolean {
    if (!this.canManage) {
      return false;
    }
    const status = this.user?.status;
    if (this.isStructure) {
      return status === "BLOCKED" || status === "TEMPORARILY_BLOCKED";
    }
    return status === "BLOCKED";
  }

  public get expectedBlockName(): string {
    if (!this.user) {
      return "";
    }
    return `${this.user.nom} ${this.user.prenom}`.trim();
  }

  public get isBlockNameConfirmed(): boolean {
    return (
      this.blockConfirmationInput.trim().toLowerCase() ===
      this.expectedBlockName.toLowerCase()
    );
  }

  public get isUnblockMotifValid(): boolean {
    return this.unblockMotif.trim().length >= 3;
  }

  public get confirmText(): string {
    if (this.confirmKind === "promote") {
      return "transmettre les droits administrateur à";
    }
    return "réinitialiser le mot de passe de l'utilisateur";
  }

  // ---- Structure-only quick actions -------------------------------------

  public openConfirm(kind: ConfirmKind): void {
    this.confirmKind = kind;
    this.confirmModal?.open();
  }

  public closeConfirm(): void {
    this.confirmKind = null;
    this.confirmModal?.close();
  }

  public doConfirm(): void {
    if (!this.isStructure || !this.confirmKind) {
      return;
    }
    const user = this.user as UsersForAdminList;
    if (this.confirmKind === "promote") {
      this.store.dispatch(UsersActions.elevateRole({ uuid: user.uuid }));
      this.toastService.success(
        "L'utilisateur a été promu au rôle admin avec succès"
      );
    } else {
      this.store.dispatch(
        UsersActions.resetPassword({ email: user.email, userId: user.id })
      );
      this.toastService.success(
        "Le lien de réinitialisation a été demandé. Il sera disponible dans la liste après rechargement."
      );
    }
    this.closeConfirm();
    this.refresh.emit();
  }

  public copyResetLink(): void {
    if (!this.isStructure) {
      return;
    }
    const link = this.buildResetLink(this.user as UsersForAdminList);
    if (!link) {
      this.toastService.error("Aucun lien de réinitialisation disponible");
      return;
    }
    this.clipboard.copy(link);
    this.toastService.success(
      "Le lien de réinitialisation a été copié dans le presse-papier"
    );
  }

  // ---- Edit (supervisor) -------------------------------------------------

  public requestEdit(): void {
    this.editRequest.emit();
  }

  // ---- Block / Unblock (shared) -----------------------------------------

  public openBlockModal(): void {
    this.blockConfirmationInput = "";
    this.blockUserModal.open();
  }

  public closeBlockModal(): void {
    this.blockConfirmationInput = "";
    this.actionLoading = false;
    this.blockUserModal?.close();
  }

  public confirmBlock(): void {
    if (!this.user || !this.isBlockNameConfirmed) {
      return;
    }
    this.actionLoading = true;
    const obs$ = this.isStructure
      ? this.adminUsersApi.blockUser(
          (this.user as UsersForAdminList).structureUuid,
          this.user.uuid!
        )
      : this.manageUsersService.blockSupervisorUser(this.user.uuid!);
    this.subscription.add(
      obs$.subscribe({
        next: () => {
          this.toastService.success("L'utilisateur a été bloqué");
          this.closeBlockModal();
          this.refresh.emit();
        },
        error: () => {
          this.actionLoading = false;
          this.toastService.error("Impossible de bloquer l'utilisateur");
        },
      })
    );
  }

  public openUnblockModal(): void {
    this.unblockMotif = "";
    this.unblockUserModal.open();
  }

  public closeUnblockModal(): void {
    this.unblockMotif = "";
    this.actionLoading = false;
    this.unblockUserModal?.close();
  }

  public confirmUnblock(): void {
    if (!this.user || !this.isUnblockMotifValid) {
      return;
    }
    this.actionLoading = true;
    const motif = this.unblockMotif.trim();
    const obs$ = this.isStructure
      ? this.adminUsersApi.unblockUserWithMotif(
          (this.user as UsersForAdminList).structureUuid,
          this.user.uuid!,
          motif
        )
      : this.adminUsersApi.unblockSupervisorUser(this.user.uuid!, motif);
    this.subscription.add(
      obs$.subscribe({
        next: () => {
          this.toastService.success("L'utilisateur a été débloqué");
          this.closeUnblockModal();
          this.refresh.emit();
        },
        error: () => {
          this.actionLoading = false;
          this.toastService.error("Impossible de débloquer l'utilisateur");
        },
      })
    );
  }

  // ---- Delete (supervisor) ----------------------------------------------

  public openDeleteModal(): void {
    this.deleteUserConfirmationModal?.open();
  }

  public onDeleteComplete(): void {
    this.deleteUserConfirmationModal?.close();
    this.refresh.emit();
  }

  // ---- Helpers ----------------------------------------------------------

  private buildResetLink(user: UsersForAdminList): string {
    if (
      !user?.id ||
      !user?.temporaryTokens?.token ||
      user?.temporaryTokens?.type !== "reset-password" ||
      !this.isTokenValid(user)
    ) {
      return "";
    }
    return `${environment.frontendUrl}users/reset-password/${user.id}/${user.temporaryTokens.token}`;
  }

  private isTokenValid(user: UsersForAdminList): boolean {
    if (!user?.temporaryTokens?.validity) {
      return false;
    }
    return new Date(user.temporaryTokens.validity) > new Date();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
