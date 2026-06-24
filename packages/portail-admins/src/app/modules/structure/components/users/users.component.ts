import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import {
  USER_FONCTION_LABELS,
  UserFonction,
  UserStructure,
  StructureAdmin,
} from "@domifa/common";

import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { filter, map, Subject, Subscription, switchMap, take } from "rxjs";
import { StructureService } from "../../services/structure.service";
import { environment } from "../../../../../environments/environment";
import { subMonths } from "date-fns";
import { CustomToastService } from "../../../shared/services";
import { Clipboard } from "@angular/cdk/clipboard";
import { UserStructureWithSecurity } from "../../../admin-auth/types/UserStructureWithSecurity.type";
import { selectStructureByUuid } from "../../../shared/store/structures";
import {
  DsfrButtonModule,
  DsfrButtonsGroupModule,
  DsfrModalComponent,
  DsfrModalModule,
} from "@edugouvfr/ngx-dsfr";
import {
  DsfrDropdownMenuComponent,
  DsfrDropdownMenuItemComponent,
} from "@edugouvfr/ngx-dsfr-ext";
import { UsersTableComponent } from "../../../shared/components/users-table/users-table.component";
import { RegisterUserComponent } from "../register-user/register-user.component";

export enum MODAL_ACTION {
  PROMOTE_USER = "PROMOTE_USER",
  REINIT_USER_PASSWORD = "REINIT_USER_PASSWORD",
}

export interface ConfirmModalContext {
  actionText: string;
  action: (user: UserWithSecurityViewModel) => void;
}

type UserWithSecurityViewModel = UserStructure & {
  remainingBackoffMinutes?: number | null;
  temporaryTokens: {
    type?: string;
    token?: string;
    validity?: Date;
  };
};

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrl: "./users.component.css",
  imports: [
    CommonModule,
    FormsModule,
    DsfrModalModule,
    DsfrButtonModule,
    DsfrButtonsGroupModule,
    DsfrDropdownMenuComponent,
    DsfrDropdownMenuItemComponent,
    UsersTableComponent,
    RegisterUserComponent,
  ],
})
export class UsersComponent implements OnInit, OnDestroy {
  public users: UserWithSecurityViewModel[] = [];
  public twoMonthsAgo = subMonths(new Date(), 2);
  public readonly reloadUsersSubject$ = new Subject<void>();
  public readonly frontendUrl = environment.frontendUrl;
  public readonly USER_FONCTION = UserFonction;
  public readonly _USER_FONCTION_LABELS = USER_FONCTION_LABELS;
  public readonly MODAL_ACTION = MODAL_ACTION;
  public structureUuid: string;
  public structure?: StructureAdmin;
  private readonly subscription = new Subscription();
  public searching = true;
  @ViewChild("confirmModal")
  public confirmModal!: DsfrModalComponent;
  @ViewChild("registerUser")
  public registerUser!: RegisterUserComponent;
  @ViewChild("blockModal")
  public blockModal!: DsfrModalComponent;
  public confirmModalContext?: ConfirmModalContext;
  public userForModal?: UserWithSecurityViewModel;
  public userToBlock?: UserWithSecurityViewModel;
  public blockConfirmationInput = "";
  constructor(
    private readonly structureService: StructureService,
    private readonly toastService: CustomToastService,
    private readonly clipboard: Clipboard,
    private readonly activatedRoute: ActivatedRoute,
    private readonly store: Store
  ) {}

  ngOnInit(): void {
    this.structureUuid =
      this.activatedRoute.parent.snapshot.params.structureUuid;

    // Wait for the structure to be loaded in the store before fetching the
    // users : getUsers needs the structure uuid and selectStructureByUuid
    // emits undefined while the list is still loading.
    this.subscription.add(
      this.store
        .select(selectStructureByUuid(this.structureUuid))
        .pipe(
          filter((structure): structure is StructureAdmin => !!structure),
          take(1)
        )
        .subscribe((structure) => {
          this.structure = structure;
          this.loadUsers();
        })
    );

    this.subscription.add(
      this.reloadUsersSubject$.subscribe(() => {
        this.loadUsers();
      })
    );
  }

  private loadUsers(): void {
    this.searching = true;
    if (!this.structure?.uuid) {
      this.searching = false;
      return;
    }
    this.subscription.add(
      this.structureService.getUsers(this.structure.uuid).subscribe((users) => {
        this.users = users.map((user) => mapUserStructureToViewModel(user));
        this.searching = false;
      })
    );
  }

  public openConfirmationModal(
    user: UserWithSecurityViewModel,
    modalAction: MODAL_ACTION
  ): void {
    this.setConfirmModalContext(user, modalAction);
    this.userForModal = user;
    this.confirmModal.open();
  }

  public openAddUserModal(): void {
    this.registerUser.open(this.structure);
  }

  public openBlockModal(user: UserWithSecurityViewModel): void {
    this.userToBlock = user;
    this.blockConfirmationInput = "";
    this.blockModal.open();
  }

  public cancelBlock(): void {
    this.userToBlock = null;
    this.blockConfirmationInput = "";
    this.blockModal.close();
  }

  public confirmBlock(): void {
    if (!this.userToBlock || !this.isBlockNameConfirmed) return;

    if (!this.structure?.uuid || !this.userToBlock.uuid) {
      return;
    }
    const targetUuid = this.userToBlock.uuid;
    this.subscription.add(
      this.structureService
        .blockUser(this.structure.uuid, targetUuid)
        .subscribe({
          next: () => {
            this.toastService.success("L'utilisateur a été bloqué");
            this.userToBlock = null;
            this.blockConfirmationInput = "";
            this.blockModal.close();
            this.reloadUsersSubject$.next();
          },
          error: () => {
            this.toastService.error("Erreur lors du blocage de l'utilisateur");
          },
        })
    );
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

  public setConfirmModalContext(
    user: UserWithSecurityViewModel,
    modalAction: MODAL_ACTION
  ): void {
    const isPromoteUser = modalAction === MODAL_ACTION.PROMOTE_USER;
    this.confirmModalContext = {
      actionText: isPromoteUser
        ? "transmettre les droits administrateur à"
        : `réinitialiser le mot de passe de l'utilisateur`,
      action: isPromoteUser
        ? () => this.doElevateRole(user)
        : () => this.doResetPasswordAndCopyLink(user),
    };
  }

  public doElevateRole(user: UserWithSecurityViewModel) {
    this.subscription.add(
      this.structureService.elevateUserRole(user.uuid).subscribe({
        next: () => {
          this.reloadUsersSubject$.next();
          this.toastService.success(
            "L'utilisateur a été promu au rôle admin avec succès"
          );
          this.userForModal = null;
        },
        error: () => {
          this.toastService.error("Une erreur serveur est survenue");
          this.userForModal = null;
        },
      })
    );
    this.confirmModal.close();
  }

  public generateResetPasswordLink(user: UserStructureWithSecurity): string {
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

  public doResetPasswordAndCopyLink(user: UserWithSecurityViewModel): void {
    if (!user || !this.structure?.uuid) {
      return;
    }
    const structureUuid = this.structure.uuid;

    this.subscription.add(
      this.structureService
        .resetStructureAdminPassword(user.email)
        .pipe(
          switchMap(() => this.structureService.getUsers(structureUuid)),
          // Get user from users
          map((users) => {
            this.users = users.map((user) => mapUserStructureToViewModel(user));
            return users.find((u) => u.id === user.id);
          }),
          filter((updatedUser) => !!updatedUser)
        )
        .subscribe({
          next: (updatedUser) => {
            const resetLink = this.generateResetPasswordLink(updatedUser);
            if (resetLink) {
              this.clipboard.copy(resetLink);
              this.toastService.success(
                "Le lien de réinitialisation a été généré et copié dans le presse-papier"
              );
              this.userForModal = null;
              this.reloadUsersSubject$.next();
            } else {
              this.toastService.error("Erreur lors de la génération du lien");
              this.userForModal = null;
            }
          },
          error: () => {
            this.toastService.error(
              "Erreur lors de la réinitialisation du mot de passe"
            );
          },
        })
    );

    this.confirmModal.close();
  }

  public getLink(user: UserStructureWithSecurity): void {
    if (!user) return;

    // Check if link is not expired
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

  private isTokenValid(user: UserStructureWithSecurity): boolean {
    if (!user?.temporaryTokens?.validity) {
      return false;
    }

    const now = new Date();
    const validity = new Date(user.temporaryTokens.validity);

    return validity > now;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

const mapUserStructureToViewModel = (
  user: UserStructureWithSecurity
): UserWithSecurityViewModel => ({
  ...user,
  lastLogin: user?.lastLogin ? new Date(user.lastLogin) : null,
  passwordLastUpdate: user?.passwordLastUpdate
    ? new Date(user.passwordLastUpdate)
    : null,
});
