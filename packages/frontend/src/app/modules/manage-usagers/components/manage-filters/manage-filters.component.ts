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
} from "../usager-filter/UsagersFilterCriteria";
import {
  extractDeadlines,
  UsagersFilterCriteriaDernierPassage,
  UsagersFilterCriteriaEcheance,
  UsagersFilterCriteriaStatut,
} from "@domifa/common";

@Component({
  selector: "app-manage-filters",
  templateUrl: "./manage-filters.component.html",
  styleUrls: ["../manage-usagers-page/manage-usagers-page.component.scss"],
})
export class ManageFiltersComponent implements OnInit, OnChanges {
  @Input() public filters: UsagersFilterCriteria;
  @Input() public usagersRadiesLoadedCount: number;
  @Input() public usagersRadiesTotalCount: number;
  @Input() public nbResults: number;

  @Output() public readonly updateFilters = new EventEmitter();
  public readonly UsagersFilterCriteriaStatut = UsagersFilterCriteriaStatut;

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

  public readonly labelsEntretien = {
    COMING: "à venir",
    OVERDUE: "date dépassée",
  };

  public sortLabel = "échéance";
  public sortMenuItems: Array<{
    id: UsagersFilterCriteriaSortKey;
    label: string;
  }> = [];

  ngOnInit(): void {
    this.sortMenuItems = this.getSortKeys();
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
}
