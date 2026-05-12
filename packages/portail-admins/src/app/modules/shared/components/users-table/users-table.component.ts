import { CommonModule } from "@angular/common";
import {
  Component,
  ContentChild,
  Input,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import {
  SortValues,
  USER_STRUCTURE_ROLES_LABELS,
  UserStatus,
} from "@domifa/common";

import { TableHeadSortComponent } from "../table-head-sort/table-head-sort.component";
import { DisplayLastLoginComponent } from "../display-last-login/display-last-login.component";
import { FullNamePipe, SortArrayPipe } from "../../pipes";
import {
  USER_STATUS_BADGE_CLASS,
  USER_STATUS_LABELS,
  UsersTableRow,
} from "./users-table.types";

@Component({
  selector: "app-users-table",
  templateUrl: "./users-table.component.html",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableHeadSortComponent,
    DisplayLastLoginComponent,
    FullNamePipe,
    SortArrayPipe,
  ],
})
export class UsersTableComponent implements OnInit {
  @Input() public users: UsersTableRow[] = [];
  @Input() public tableId = "users-table";
  @Input() public caption = "Liste des utilisateurs";
  @Input() public showId = false;
  @Input() public showStructure = false;
  @Input() public showSearch = true;
  @Input() public searchPlaceholder = "Rechercher par nom, email ou structure";
  @Input() public initialSortKey: keyof UsersTableRow = "nom";

  @ContentChild("actionsCell", { read: TemplateRef })
  public actionsTemplate?: TemplateRef<{ $implicit: UsersTableRow }>;

  public sortValue: SortValues = "asc";
  public currentKey: string = "nom";
  public searchTerm = "";
  public statusFilter: UserStatus | "" = "";

  public readonly STATUS_OPTIONS: { value: UserStatus | ""; label: string }[] =
    [
      { value: "", label: "Tous les statuts" },
      { value: "ACTIVE", label: USER_STATUS_LABELS.ACTIVE },
      { value: "PENDING", label: USER_STATUS_LABELS.PENDING },
      { value: "BLOCKED", label: USER_STATUS_LABELS.BLOCKED },
      {
        value: "TEMPORARILY_BLOCKED",
        label: USER_STATUS_LABELS.TEMPORARILY_BLOCKED,
      },
    ];

  public readonly USER_STRUCTURE_ROLES_LABELS = USER_STRUCTURE_ROLES_LABELS;
  public readonly USER_STATUS_LABELS = USER_STATUS_LABELS;
  public readonly USER_STATUS_BADGE_CLASS = USER_STATUS_BADGE_CLASS;

  ngOnInit(): void {
    this.currentKey = this.initialSortKey as string;
  }

  public userTrackBy(_index: number, user: UsersTableRow): string {
    return user.uuid;
  }

  public get filteredUsers(): UsersTableRow[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.users.filter((user) => {
      if (this.statusFilter && user.status !== this.statusFilter) {
        return false;
      }
      if (!term) return true;
      const haystack = [user.nom, user.prenom, user.email, user.structureName]
        .filter((v): v is string => !!v)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  public clearSearch(): void {
    this.searchTerm = "";
  }

  public clearStatusFilter(): void {
    this.statusFilter = "";
  }

  public get hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.statusFilter;
  }

  public get columnsCount(): number {
    let count = 6;
    if (this.showId) count++;
    if (this.showStructure) count++;
    if (this.actionsTemplate) count++;
    return count;
  }
}
