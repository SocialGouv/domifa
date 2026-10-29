import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {
  DEPARTEMENTS_LISTE,
  RegionManagedUser,
  REGIONS_LISTE,
  USER_STATUS_LABELS,
} from "@domifa/common";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { Subscription } from "rxjs";
import { PortailStatsAuthService } from "../../../auth/services/portail-stats-auth.service";
import { CustomToastService } from "../../../shared/services";
import { RegionUsersService } from "../../services/region-users.service";

type SortKey =
  | "nom"
  | "email"
  | "profile"
  | "createdAt"
  | "lastLogin"
  | "department"
  | "status";

type BadgeSeverity = "success" | "info" | "warning" | "error";

type RegionUserRow = RegionManagedUser & {
  fullName: string;
  profile: string;
  department: string;
  statusLabel: string;
  statusSeverity: BadgeSeverity;
};

const toTime = (date: Date | null): number =>
  date ? new Date(date).getTime() : 0;

const SORT_VALUES: Record<SortKey, (user: RegionUserRow) => string | number> = {
  nom: (user) => user.fullName.toLowerCase(),
  email: (user) => user.email,
  profile: (user) => user.profile,
  createdAt: (user) => toTime(user.createdAt),
  lastLogin: (user) => toTime(user.lastLogin),
  department: (user) => user.department,
  status: (user) => user.statusLabel,
};

@Component({
  selector: "app-region-users-list",
  templateUrl: "./region-users-list.component.html",
  styleUrls: ["./region-users-list.component.scss"],
  standalone: false,
})
export class RegionUsersListComponent implements OnInit, OnDestroy {
  @ViewChild("registerModal", { static: true })
  public registerModal!: DsfrModalComponent;

  @ViewChild("deleteModal", { static: true })
  public deleteModal!: DsfrModalComponent;

  public users: RegionUserRow[] = [];
  public loading = true;
  public showInfo = true;
  public userToDelete: RegionManagedUser | null = null;

  public sortKey: SortKey = "nom";
  public sortAsc = true;

  public readonly columns: { key: SortKey; label: string }[] = [
    { key: "nom", label: "Nom prénom" },
    { key: "email", label: "Email" },
    { key: "profile", label: "Profil" },
    { key: "createdAt", label: "Date d'ajout" },
    { key: "lastLogin", label: "Dernière connexion" },
    { key: "department", label: "Territoire d'action" },
    { key: "status", label: "Statut" },
  ];

  private readonly subscription = new Subscription();

  constructor(
    private readonly regionUsersService: RegionUsersService,
    private readonly toastService: CustomToastService,
    private readonly authService: PortailStatsAuthService
  ) {}

  // The API refuses it too: a DREETS cannot delete its own account
  public isCurrentUser(user: RegionManagedUser): boolean {
    return user.uuid === this.authService.currentUserValue?.uuid;
  }

  public ngOnInit(): void {
    this.getUsers();
  }

  public getUsers(): void {
    this.loading = true;
    this.subscription.add(
      this.regionUsersService.getUsers().subscribe({
        next: (users) => {
          this.users = users.map((user) => this.toRow(user));
          this.sortUsers();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible de charger les utilisateurs");
        },
      })
    );
  }

  public sortBy(key: SortKey): void {
    this.sortAsc = this.sortKey === key ? !this.sortAsc : true;
    this.sortKey = key;
    this.sortUsers();
  }

  public getAriaSort(key: SortKey): "ascending" | "descending" | "none" {
    if (this.sortKey !== key) {
      return "none";
    }
    return this.sortAsc ? "ascending" : "descending";
  }

  public openRegisterModal(): void {
    this.registerModal.open();
  }

  public onUserRegistered(): void {
    this.registerModal.close();
    this.getUsers();
  }

  public openDeleteModal(user: RegionManagedUser): void {
    this.userToDelete = user;
    this.deleteModal.open();
  }

  public onUserDeleted(): void {
    this.deleteModal.close();
    this.userToDelete = null;
    this.getUsers();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private sortUsers(): void {
    const getValue = SORT_VALUES[this.sortKey];
    const direction = this.sortAsc ? 1 : -1;
    this.users = [...this.users].sort((a, b) => {
      const valueA = getValue(a);
      const valueB = getValue(b);
      if (valueA < valueB) {
        return -direction;
      }
      return valueA > valueB ? direction : 0;
    });
  }

  private toRow(user: RegionManagedUser): RegionUserRow {
    const territory = user.territories?.[0];
    const territoryName =
      user.role === "region"
        ? REGIONS_LISTE[territory]
        : DEPARTEMENTS_LISTE[territory];

    let statusLabel = USER_STATUS_LABELS[user.status];
    let statusSeverity: BadgeSeverity = "warning";
    if (user.status === "ACTIVE") {
      statusLabel = user.passwordLastUpdate ? "Validé" : "Invitation envoyée";
      statusSeverity = user.passwordLastUpdate ? "success" : "info";
    } else if (user.status === "BLOCKED") {
      statusSeverity = "error";
    }

    return {
      ...user,
      fullName: `${user.nom} ${user.prenom}`,
      profile: user.role === "region" ? "DREETS" : "DDETS",
      department: territory ? `${territory} - ${territoryName ?? ""}` : "",
      statusLabel,
      statusSeverity,
    };
  }
}
