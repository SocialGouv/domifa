import { Clipboard } from "@angular/cdk/clipboard";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Store } from "@ngrx/store";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { Observable, Subscription } from "rxjs";

import { UsersForAdminList, UserStatus } from "@domifa/common";

import { environment } from "../../../../../environments/environment";
import { UserStructureEventHistoryLabels } from "../../../admin-auth/types/event-history";
import { CustomToastService } from "../../../shared/services";
import { UserSecurityEventType } from "../../../shared/types/UserSecurityEvent.type";
import {
  selectAllAdminUsers,
  selectIsAdminUsersLoading,
  UsersActions,
} from "../../../shared/store/users";

enum MODAL_ACTION {
  PROMOTE_USER = "PROMOTE_USER",
  REINIT_USER_PASSWORD = "REINIT_USER_PASSWORD",
}

const EVENT_CONFIG: {
  [key in UserSecurityEventType]: {
    class: "success" | "error";
    label: "Succès" | "Erreur";
  };
} = {
  "login-success": { class: "success", label: "Succès" },
  "change-password-success": { class: "success", label: "Succès" },
  "reset-password-success": { class: "success", label: "Succès" },
  "reset-password-request": { class: "success", label: "Succès" },
  "validate-account-success": { class: "success", label: "Succès" },
  "validate-account-error": { class: "error", label: "Erreur" },
  "login-error": { class: "error", label: "Erreur" },
  "change-password-error": { class: "error", label: "Erreur" },
  "reset-password-error": { class: "error", label: "Erreur" },
} as const;

type AdminUserViewModel = UsersForAdminList & {
  eventsHistory: {
    type: UserSecurityEventType;
    date: Date;
    eventLevel: string;
    eventLabel: string;
  }[];
};

interface ConfirmModalContext {
  actionText: string;
  action: (user: AdminUserViewModel) => void;
}

@Component({
  selector: "app-structure-users-list",
  templateUrl: "./structure-users-list.component.html",
  standalone: false,
})
export class StructureUsersListComponent implements OnInit, OnDestroy {
  public users: AdminUserViewModel[] = [];
  public statusCounts: Record<UserStatus, number> = {
    ACTIVE: 0,
    PENDING: 0,
    BLOCKED: 0,
    TEMPORARILY_BLOCKED: 0,
  };
  public readonly loading$: Observable<boolean>;

  public userForModal?: AdminUserViewModel;
  public confirmModalContext?: ConfirmModalContext;

  public userToBlock?: AdminUserViewModel;
  public blockConfirmationInput = "";

  public readonly MODAL_ACTION = MODAL_ACTION;
  public readonly USER_ACTIVITY_LABELS = UserStructureEventHistoryLabels;
  public readonly frontendUrl = environment.frontendUrl;

  @ViewChild("confirmModal") public confirmModal!: DsfrModalComponent;
  @ViewChild("infoModal") public informationModal!: DsfrModalComponent;
  @ViewChild("blockModal") public blockModal!: DsfrModalComponent;

  private readonly subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly clipboard: Clipboard
  ) {
    this.loading$ = this.store.select(selectIsAdminUsersLoading);
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Gérer les utilisateurs des structures");

    this.subscription.add(
      this.store.select(selectAllAdminUsers).subscribe((users) => {
        this.users = users.map((user) => this.mapToViewModel(user));
        this.computeStatusCounts(this.users);
      })
    );

    this.store.dispatch(UsersActions.load());
  }

  public openConfirmationModal(
    user: AdminUserViewModel,
    modalAction: MODAL_ACTION
  ): void {
    this.setConfirmModalContext(modalAction);
    this.userForModal = user;
    this.confirmModal.open();
  }

  public openInformationModal(user: AdminUserViewModel): void {
    this.userForModal = user;
    this.informationModal.open();
  }

  public setConfirmModalContext(modalAction: MODAL_ACTION): void {
    const isPromoteUser = modalAction === MODAL_ACTION.PROMOTE_USER;
    this.confirmModalContext = {
      actionText: isPromoteUser
        ? "transmettre les droits administrateur à"
        : "réinitialiser le mot de passe de l'utilisateur",
      action: isPromoteUser
        ? (target) => this.doElevateRole(target)
        : (target) => this.doResetPassword(target),
    };
  }

  public doElevateRole(user: AdminUserViewModel): void {
    this.store.dispatch(UsersActions.elevateRole({ uuid: user.uuid }));
    this.toastService.success(
      "L'utilisateur a été promu au rôle admin avec succès"
    );
    this.userForModal = undefined;
    this.confirmModal.close();
  }

  public openBlockModal(user: AdminUserViewModel): void {
    this.userToBlock = user;
    this.blockConfirmationInput = "";
    this.blockModal.open();
  }

  public cancelBlock(): void {
    this.userToBlock = undefined;
    this.blockConfirmationInput = "";
    this.blockModal.close();
  }

  public confirmBlock(): void {
    if (!this.userToBlock || !this.userToBlock.structureId) return;
    if (!this.isBlockNameConfirmed) return;
    this.store.dispatch(
      UsersActions.blockUser({
        structureId: this.userToBlock.structureId,
        userId: this.userToBlock.id,
      })
    );
    this.toastService.success("L'utilisateur a été bloqué");
    this.userToBlock = undefined;
    this.blockConfirmationInput = "";
    this.blockModal.close();
  }

  public get expectedBlockName(): string {
    if (!this.userToBlock) return "";
    return `${this.userToBlock.nom} ${this.userToBlock.prenom}`.trim();
  }

  public get isBlockNameConfirmed(): boolean {
    return (
      this.blockConfirmationInput.trim().toLowerCase() ===
      this.expectedBlockName.toLowerCase()
    );
  }

  public unblockUser(user: AdminUserViewModel): void {
    if (!user.structureId) return;
    this.store.dispatch(
      UsersActions.unblockUser({
        structureId: user.structureId,
        userId: user.id,
      })
    );
    this.toastService.success("L'utilisateur a été débloqué");
    this.userForModal = undefined;
    this.informationModal?.close();
  }

  public doResetPassword(user: AdminUserViewModel): void {
    if (!user) return;
    this.store.dispatch(
      UsersActions.resetPassword({ email: user.email, userId: user.id })
    );
    this.toastService.success(
      "Le lien de réinitialisation a été demandé. Il sera disponible dans la liste après rechargement."
    );
    this.userForModal = undefined;
    this.confirmModal.close();
  }

  public getLink(user: UsersForAdminList): void {
    if (!user) return;

    if (!this.isTokenValid(user)) {
      this.toastService.error("Le token de réinitialisation a expiré");
      return;
    }

    const resetLink = this.generateResetPasswordLink(user);

    if (resetLink) {
      this.clipboard.copy(resetLink);
      this.toastService.success(
        "Le lien de réinitialisation a été copié dans le presse-papier"
      );
    } else {
      this.toastService.error("Aucun lien de réinitialisation disponible");
    }
  }

  public generateResetPasswordLink(user: UsersForAdminList): string {
    if (
      !user?.id ||
      !user?.temporaryTokens?.token ||
      user?.temporaryTokens?.type !== "reset-password" ||
      !this.isTokenValid(user)
    ) {
      return "";
    }
    return `${this.frontendUrl}users/reset-password/${user.id}/${user.temporaryTokens.token}`;
  }

  private isTokenValid(user: UsersForAdminList): boolean {
    if (!user?.temporaryTokens?.validity) {
      return false;
    }
    const now = new Date();
    const validity = new Date(user.temporaryTokens.validity);
    return validity > now;
  }

  private computeStatusCounts(users: AdminUserViewModel[]): void {
    const counts: Record<UserStatus, number> = {
      ACTIVE: 0,
      PENDING: 0,
      BLOCKED: 0,
      TEMPORARILY_BLOCKED: 0,
    };
    for (const user of users) {
      if (counts[user.status] !== undefined) {
        counts[user.status]++;
      }
    }
    this.statusCounts = counts;
  }

  private mapToViewModel(user: UsersForAdminList): AdminUserViewModel {
    return {
      ...user,
      eventsHistory: (user.eventsHistory ?? [])
        .map((event) => {
          const type = event.type as UserSecurityEventType;
          return {
            type,
            date: new Date(event.date),
            eventLevel: EVENT_CONFIG[type]?.class ?? "success",
            eventLabel: EVENT_CONFIG[type]?.label ?? "Succès",
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    };
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
