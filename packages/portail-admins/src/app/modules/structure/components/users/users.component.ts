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
import { faPersonArrowUpFromLine } from "@fortawesome/free-solid-svg-icons";

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
  public readonly personArrowUp = faPersonArrowUpFromLine;
  public readonly USER_ROLES_LABELS: { [key in UserStructureRole]: string } = {
    admin: "Administrateur",
    responsable: "Gestionnaire",
    simple: "Instructeur",
    facteur: "Facteur",
  };
  @Input({ required: true }) public structure: StructureCommon;
  private subscription = new Subscription();
  public searching = true;
  @ViewChild("confirmPasswordReinit", { static: true })
  public confirmPasswordReinit!: TemplateRef<NgbModalRef>;

  public userForPasswordReinit?: UserStructureWithSecurity;
  constructor(
    private readonly structureService: StructureService,
    private readonly modalService: NgbModal
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

  public openConfirmationModdal(user: UserStructureWithSecurity): void {
    this.userForPasswordReinit = user;
    this.modalService.open(this.confirmPasswordReinit, {
      size: "s",
      centered: true,
    });
  }

  public doResetPassword(email: string): void {
    if (!email) return;
    this.subscription.add(
      this.structureService
        .resetStructureAdminPassword(email)
        .subscribe(() => this.reloadUsersSubject$.next())
    );

    this.modalService.dismissAll();
  }

  public doElevateRole(user: UserStructureWithSecurity) {
    this.subscription.add(
      this.structureService.elevateUserRole(user.uuid).subscribe({
        next: () => {
          this.reloadUsersSubject$.next();
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
