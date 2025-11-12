import { ActivatedRoute } from "@angular/router";
import {
  USER_FONCTION_LABELS,
  UserFonction,
  SortValues,
  UserStructure,
  USER_STRUCTURE_ROLES_LABELS,
} from "@domifa/common";

import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { filter, map, Subject, Subscription, switchMap } from "rxjs";
import { StructureService } from "../../services/structure.service";
import { environment } from "../../../../../environments/environment";
import { subMonths } from "date-fns";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CustomToastService } from "../../../shared/services";
import { Clipboard } from "@angular/cdk/clipboard";
import { UserStructureEventHistoryLabels } from "../../../admin-auth/types/event-history";
import { UserSecurityEventType } from "../../../shared/types/UserSecurityEvent.type";
import { UserStructureWithSecurity } from "../../../admin-auth/types/UserStructureWithSecurity.type";
import { structuresCache } from "../../../shared/store";
import { ApiStructureAdmin } from "../../../admin-structures/types";

export enum MODAL_ACTION {
  PROMOTE_USER = "PROMOTE_USER",
  REINIT_USER_PASSWORD = "REINIT_USER_PASSWORD",
}

const EVENT_CONFIG: {
  [key in UserSecurityEventType]: {
    class: "green" | "red";
    label: "Succès" | "Erreur";
  };
} = {
  "login-success": { class: "green", label: "Succès" },
  "change-password-success": { class: "green", label: "Succès" },
  "reset-password-success": { class: "green", label: "Succès" },
  "reset-password-request": { class: "green", label: "Succès" },
  "validate-account-success": { class: "green", label: "Succès" },
  "validate-account-error": { class: "red", label: "Erreur" },
  "login-error": { class: "red", label: "Erreur" },
  "change-password-error": { class: "red", label: "Erreur" },
  "reset-password-error": { class: "red", label: "Erreur" },
} as const;

export interface ConfirmModalContext {
  actionText: string;
  action: (user: UserWithSecurityViewModel) => void;
}

type UserWithSecurityViewModel = UserStructure & {
  remainingBackoffMinutes?: number;
} & {
  temporaryTokens: {
    type?: string;
    token?: string;
    validity?: Date;
  };
  eventsHistory: {
    type: UserSecurityEventType;
    date: Date;
    eventLevel: string;
    eventLabel: string;
  }[];
};

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrl: "./users.component.css",
})
export class UsersComponent implements OnInit, OnDestroy {
  public users: UserWithSecurityViewModel[] = [];
  public sortValue: SortValues = "asc";
  public currentKey = "id";
  public twoMonthsAgo = subMonths(new Date(), 2);
  public readonly reloadUsersSubject$ = new Subject<void>();
  public readonly frontendUrl = environment.frontendUrl;
  public readonly USER_FONCTION = UserFonction;
  public readonly _USER_FONCTION_LABELS = USER_FONCTION_LABELS;
  public readonly USER_ACTIVITY_LABELS = UserStructureEventHistoryLabels;
  public readonly MODAL_ACTION = MODAL_ACTION;
  public readonly USER_ROLES_LABELS = USER_STRUCTURE_ROLES_LABELS;
  public structureId: number;
  public structure?: ApiStructureAdmin;
  private readonly subscription = new Subscription();
  public searching = true;
  @ViewChild("confirmModal", { static: true })
  public confirmModal!: TemplateRef<NgbModalRef>;
  @ViewChild("infoModal", { static: true })
  public informationModal!: TemplateRef<NgbModalRef>;
  public confirmModalContext?: ConfirmModalContext;

  public userForModal?: UserWithSecurityViewModel;
  constructor(
    private readonly structureService: StructureService,
    private readonly modalService: NgbModal,
    private readonly toastService: CustomToastService,
    private readonly clipboard: Clipboard,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.structureId = parseInt(
      this.activatedRoute.parent.snapshot.params.structureId
    );
    this.structure = structuresCache.getStructureById(this.structureId);
    this.loadUsers();

    // Subscribe to reloadUsers subject to reload the list when triggered
    this.subscription.add(
      this.reloadUsersSubject$.subscribe(() => {
        this.loadUsers();
      })
    );
  }

  private loadUsers(): void {
    this.searching = true;
    this.subscription.add(
      this.structureService.getUsers(this.structureId).subscribe((users) => {
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
    this.modalService.open(this.confirmModal, {
      size: "s",
      centered: true,
    });
  }

  public openInformationModal(user: UserWithSecurityViewModel): void {
    this.userForModal = user;
    this.modalService.open(this.informationModal, {
      size: "s",
      centered: true,
    });
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
    this.modalService.dismissAll();
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
    if (!user) return;

    this.subscription.add(
      this.structureService
        .resetStructureAdminPassword(user.email)
        .pipe(
          switchMap(() => this.structureService.getUsers(this.structureId)),
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

    this.modalService.dismissAll();
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
      // Link is ok, we can copy in the clipbaoard !
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
  lastLogin: new Date(user.lastLogin),
  eventsHistory: user.eventsHistory
    .map((eventHistory) => ({
      ...eventHistory,
      eventLevel: EVENT_CONFIG[eventHistory.type].class,
      eventLabel: EVENT_CONFIG[eventHistory.type].label,
    }))
    .sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      return bDate.getTime() - aDate.getTime();
    }),
});
