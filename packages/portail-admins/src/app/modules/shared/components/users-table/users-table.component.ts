import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import {
  compareAttributes,
  SortableValue,
  SortValues,
  USER_STRUCTURE_ROLES_LABELS,
  UserStatus,
} from "@domifa/common";

import { DsfrPaginationComponent } from "@edugouvfr/ngx-dsfr";

import { TableHeadSortComponent } from "../table-head-sort/table-head-sort.component";
import { DisplayLastLoginComponent } from "../display-last-login/display-last-login.component";
import { DisplayPasswordAgeComponent } from "../display-password-age/display-password-age.component";
import { FullNamePipe } from "../../pipes";
import {
  USER_STATUS_BADGE_CLASS,
  USER_STATUS_LABELS,
  UsersTableRow,
} from "./users-table.types";

const DEFAULT_PAGE_SIZE = 25;
const STORAGE_KEY_PREFIX = "users-table:state:";

type StoredTableState = {
  q?: string;
  status?: UserStatus | "";
  sortKey?: string;
  sortValue?: SortValues;
  page?: number;
};

@Component({
  selector: "app-users-table",
  templateUrl: "./users-table.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableHeadSortComponent,
    DisplayLastLoginComponent,
    DisplayPasswordAgeComponent,
    DsfrPaginationComponent,
    FullNamePipe,
  ],
})
export class UsersTableComponent implements OnChanges, OnInit {
  @Input() public users: UsersTableRow[] = [];
  @Input() public tableId = "users-table";
  @Input() public caption = "Liste des utilisateurs";
  @Input() public showStructure = false;
  @Input() public showSearch = true;
  @Input() public searchPlaceholder =
    "Rechercher par ID, nom, email ou structure";
  @Input() public initialSortKey: keyof UsersTableRow = "nom";
  @Input() public pageSize = DEFAULT_PAGE_SIZE;

  @ContentChild("actionsCell", { read: TemplateRef })
  public actionsTemplate?: TemplateRef<{ $implicit: UsersTableRow }>;

  public sortValue: SortValues = "asc";
  public currentKey: keyof UsersTableRow = "nom";
  public searchTerm = "";
  public statusFilter: UserStatus | "" = "";
  public currentPage = 1;

  public filteredUsers: UsersTableRow[] = [];
  public displayedUsers: UsersTableRow[] = [];
  public totalPages = 1;

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

  public ngOnInit(): void {
    // Restore filters / pagination from the previous visit to this table on
    // the same tab. Keyed by `tableId` so distinct tables stay independent.
    this.restoreState();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["initialSortKey"] && this.initialSortKey) {
      this.currentKey = this.initialSortKey;
    }
    if (changes["users"] || changes["initialSortKey"]) {
      this.refreshFilteredUsers({ resetPage: false });
    }
  }

  public onSearchChange(): void {
    this.refreshFilteredUsers({ resetPage: true });
    this.persist();
  }

  public onStatusFilterChange(): void {
    this.refreshFilteredUsers({ resetPage: true });
    this.persist();
  }

  public onSortChange(): void {
    this.refreshFilteredUsers({ resetPage: true });
    this.persist();
  }

  public onPageSelect(page: number): void {
    this.currentPage = page;
    this.updateDisplayedUsers();
    this.persist();
  }

  public userTrackBy(_index: number, user: UsersTableRow): string {
    return user.uuid;
  }

  public get hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.statusFilter;
  }

  public get columnsCount(): number {
    let count = 8;
    if (this.showStructure) count++;
    if (this.actionsTemplate) count++;
    return count;
  }

  private refreshFilteredUsers({ resetPage }: { resetPage: boolean }): void {
    const term = this.searchTerm.trim().toLowerCase();
    const statusFilter = this.statusFilter;

    const filtered = this.users.filter((user) => {
      if (statusFilter && user.status !== statusFilter) {
        return false;
      }
      if (!term) return true;
      const haystack = [
        String(user.id),
        user.uuid,
        user.nom,
        user.prenom,
        user.email,
        user.structureName,
      ]
        .filter((v): v is string => !!v)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });

    const key = this.currentKey;
    const asc = this.sortValue === "asc";
    filtered.sort((a, b) =>
      compareAttributes(a[key] as SortableValue, b[key] as SortableValue, asc)
    );

    this.filteredUsers = filtered;
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));

    if (resetPage || this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    this.updateDisplayedUsers();
  }

  private updateDisplayedUsers(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedUsers = this.filteredUsers.slice(
      start,
      start + this.pageSize
    );
  }

  private get storageKey(): string {
    return STORAGE_KEY_PREFIX + this.tableId;
  }

  private restoreState(): void {
    const raw = window.sessionStorage.getItem(this.storageKey);
    if (!raw) {
      return;
    }
    let parsed: StoredTableState;
    try {
      parsed = JSON.parse(raw) as StoredTableState;
    } catch {
      // Stored value is corrupted (e.g. truncated by a quota error). Drop it
      // and fall back to defaults rather than crashing.
      window.sessionStorage.removeItem(this.storageKey);
      return;
    }
    if (typeof parsed.q === "string") {
      this.searchTerm = parsed.q;
    }
    if (
      parsed.status === "" ||
      parsed.status === "ACTIVE" ||
      parsed.status === "PENDING" ||
      parsed.status === "BLOCKED" ||
      parsed.status === "TEMPORARILY_BLOCKED"
    ) {
      this.statusFilter = parsed.status;
    }
    if (typeof parsed.sortKey === "string") {
      this.currentKey = parsed.sortKey as keyof UsersTableRow;
    }
    if (parsed.sortValue === "asc" || parsed.sortValue === "desc") {
      this.sortValue = parsed.sortValue;
    }
    if (
      typeof parsed.page === "number" &&
      Number.isFinite(parsed.page) &&
      parsed.page > 0
    ) {
      this.currentPage = parsed.page;
    }
    this.refreshFilteredUsers({ resetPage: false });
  }

  private persist(): void {
    const state: StoredTableState = {
      q: this.searchTerm,
      status: this.statusFilter,
      sortKey: this.currentKey,
      sortValue: this.sortValue,
      page: this.currentPage,
    };
    try {
      window.sessionStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch {
      // Storage full / disabled by privacy mode → silently skip. The table
      // still works for the current session, the user just loses the
      // restore-on-back behaviour.
    }
  }
}
