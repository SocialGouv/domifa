import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from "@angular/core";
import {
  UsagersFilterCriteria,
  UsagersFilterCriteriaSortKey,
} from "../../classes/UsagersFilterCriteria";
import {
  extractDeadlines,
  SortValues,
  UsagersFilterCriteriaDernierPassage,
  UsagersFilterCriteriaEcheance,
  UsagersFilterCriteriaEntretien,
  UsagersFilterCriteriaStatut,
  UserStructureProfile,
} from "@domifa/common";
import { ManageUsersService } from "../../../manage-users/services/manage-users.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-manage-filters",
  templateUrl: "./manage-filters.component.html",
  styleUrls: ["../manage-usagers-page/manage-usagers-page.component.scss"],
})
export class ManageFiltersComponent implements OnInit, OnChanges {
  @Input({ required: true }) public filters: UsagersFilterCriteria;
  @Input({ required: true }) public usagersRadiesLoadedCount: number;
  @Input({ required: true }) public usagersRadiesTotalCount: number;
  @Input({ required: true }) public searching: boolean;
  @Input({ required: true }) public nbResults: number;

  @Input() public showFilters = false;

  @Output() public readonly updateFilters = new EventEmitter();

  public readonly UsagersFilterCriteriaStatut = UsagersFilterCriteriaStatut;
  public readonly UsagersFilterCriteriaEntretien =
    UsagersFilterCriteriaEntretien;

  public readonly labelsEcheance =
    extractDeadlines<UsagersFilterCriteriaEcheance>([
      "EXCEEDED",
      "NEXT_TWO_WEEKS",
      "NEXT_TWO_MONTHS",
    ]);

  public readonly labelsEcheanceRadiation =
    extractDeadlines<UsagersFilterCriteriaEcheance>([
      "PREVIOUS_TWO_YEARS",
      "PREVIOUS_YEAR",
    ]);

  public readonly labelsDernierPassage =
    extractDeadlines<UsagersFilterCriteriaDernierPassage>([
      "PREVIOUS_TWO_MONTHS",
      "PREVIOUS_THREE_MONTHS",
    ]);

  public readonly labelsEntretien: {
    [key in UsagersFilterCriteriaEntretien]: string;
  } = {
    COMING: "à venir",
    OVERDUE: "date dépassée",
  };

  public sortLabel = "échéance";
  public sortMenuItems: Array<{
    id: UsagersFilterCriteriaSortKey;
    label: string;
  }> = [];

  public referrers: UserStructureProfile[] = [];
  public subscription: Subscription = new Subscription();

  constructor(private readonly manageUsersService: ManageUsersService) {}

  ngOnInit(): void {
    this.sortMenuItems = this.getSortKeys();
    this.manageUsersService.referrers$.subscribe((referrers) => {
      this.referrers = referrers;
    });
  }

  ngOnChanges() {
    this.sortMenuItems = this.getSortKeys();
  }

  public getSortKeys(): Array<{
    id: UsagersFilterCriteriaSortKey;
    label: string;
  }> {
    const sortElements: Array<{
      id: UsagersFilterCriteriaSortKey;
      label: string;
    }> = [
      { id: "ID", label: "ID" },
      { id: "NOM", label: "nom" },
      { id: "ECHEANCE", label: this.getEcheanceLabel() },
    ];

    if (
      this.filters?.statut === UsagersFilterCriteriaStatut.TOUS ||
      this.filters?.statut === UsagersFilterCriteriaStatut.VALIDE
    ) {
      sortElements.push({ id: "PASSAGE", label: "dernier passage" });
    }

    return sortElements;
  }

  public getEcheanceLabel(): "radiation" | "refus" | "échéance" {
    if (this.filters?.statut === UsagersFilterCriteriaStatut.RADIE) {
      return "radiation";
    } else if (this.filters?.statut === UsagersFilterCriteriaStatut.REFUS) {
      return "refus";
    }
    return "échéance";
  }

  public get activeFilterCount(): number {
    let count = 0;
    if (this.filters.lastInteractionDate) count++;
    if (this.filters.echeance) count++;
    if (this.filters.interactionType) count++;
    if (this.filters.entretien) count++;
    if (this.filters.referrerId !== undefined) count++;
    return count;
  }

  public onFilterChange(element: string, value: string): void {
    this.updateFilters.emit({
      element,
      value: value || null,
    });
  }

  public getReferrerValue(): string {
    if (this.filters.referrerId === undefined) {
      return "";
    }
    if (this.filters.referrerId === null) {
      return "null";
    }
    return String(this.filters.referrerId);
  }

  public onReferrerChange(value: string): void {
    if (value === "") {
      this.updateFilters.emit({ element: "referrerId", value: undefined });
    } else if (value === "null") {
      this.updateFilters.emit({ element: "referrerId", value: null });
    } else {
      this.updateFilters.emit({
        element: "referrerId",
        value: parseInt(value, 10),
      });
    }
  }

  public onSortChange(value: string): void {
    const lastUnderscore = value.lastIndexOf("_");
    const sortKey = value.substring(0, lastUnderscore);
    const sortValue = value.substring(lastUnderscore + 1) as SortValues;
    this.updateFilters.emit({
      element: "sortKey",
      value: sortKey,
      sortValue,
    });
  }
}
