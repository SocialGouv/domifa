import {
  USER_FONCTION_LABELS,
  UserFonction,
  SortValues,
  StructureCommon,
  UserStructureRole,
} from "@domifa/common";
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Subject, Subscription } from "rxjs";
import {
  StructureService,
  UserStructureWithSecurity,
} from "../../services/structure.service";
import { environment } from "../../../../../environments/environment";
import { subMonths } from "date-fns";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CustomToastService } from "../../../shared/services";

export enum MODAL_ACTION {
  PROMOTE_USER = "PROMOTE_USER",
  REINIT_USER_PASSWORD = "REINIT_USER_PASSWORD",
}

export interface ConfirmModalContext {
  actionText: string;
  action: (user: UserStructureWithSecurity) => void;
}

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrl: "./users.component.css",
})
export class UsersComponent implements OnInit, OnDestroy {
  public users: UserStructureWithSecurity[] = [];
  public sortValue: SortValues = "asc";
  public currentKey = "id";
  public twoMonthsAgo = subMonths(new Date(), 2);
  public readonly reloadUsersSubject$ = new Subject<void>();
  public readonly frontendUrl = environment.frontendUrl;
  public readonly USER_FONCTION = UserFonction;
  public readonly _USER_FONCTION_LABELS = USER_FONCTION_LABELS;
  public readonly MODAL_ACTION = MODAL_ACTION;
  public readonly USER_ROLES_LABELS: { [key in UserStructureRole]: string } = {
    admin: "Administrateur",
    responsable: "Gestionnaire",
    simple: "Instructeur",
    facteur: "Facteur",
  };
  @Input({ required: true }) public structure: StructureCommon;
  private subscription = new Subscription();
  public searching = true;
  @ViewChild("confirmModal", { static: true })
  public confirmModal!: TemplateRef<NgbModalRef>;
  public confirmModalContext?: ConfirmModalContext;

  public userForConfirmModal?: UserStructureWithSecurity;
  constructor(
    private readonly structureService: StructureService,
    private readonly modalService: NgbModal,
    private readonly toastService: CustomToastService
  ) {}

  ngOnInit(): void {
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
      this.structureService.getUsers(this.structure.id).subscribe((users) => {
        this.users = users.map((user) => {
          user.lastLogin = new Date(user.lastLogin);
          return user;
        });
        this.searching = false;
      })
    );
  }

  public openConfirmationModal(
    user: UserStructureWithSecurity,
    modalAction: MODAL_ACTION
  ): void {
    this.setConfirmModalContext(user, modalAction);
    this.userForConfirmModal = user;
    this.modalService.open(this.confirmModal, {
      size: "s",
      centered: true,
    });
  }

  public setConfirmModalContext(
    user: UserStructureWithSecurity,
    modalAction: MODAL_ACTION
  ) {
    const isPromoteUser = modalAction === MODAL_ACTION.PROMOTE_USER;
    this.confirmModalContext = {
      actionText: isPromoteUser
        ? "transmettre les droits administrateur à"
        : `réinitialiser le mot de passe de l'utilisateur`,
      action: isPromoteUser
        ? () => this.doElevateRole(user)
        : () => this.doResetPassword(user),
    };
  }

  public doResetPassword(user: UserStructureWithSecurity): void {
    if (!user) return;
    this.subscription.add(
      this.structureService.resetStructureAdminPassword(user.email).subscribe({
        next: () => {
          this.reloadUsersSubject$.next();
          this.toastService.success(
            "Le lien de réinitialisation de mot de passe admin a été généré avec succès "
          );
        },
      })
    );

    this.modalService.dismissAll();
  }

  public doElevateRole(user: UserStructureWithSecurity) {
    this.subscription.add(
      this.structureService.elevateUserRole(user.uuid).subscribe({
        next: () => {
          this.reloadUsersSubject$.next();
          this.toastService.success(
            "L'utilisateur a été promu au rôle admin avec succès"
          );
        },
        error: () => {
          this.toastService.error("Une erreur serveur est survenue");
        },
      })
    );
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
