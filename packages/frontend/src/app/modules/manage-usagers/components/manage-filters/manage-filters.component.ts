import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UsagersFilterCriteria } from "../usager-filter/UsagersFilterCriteria";
import {
  extractDeadlines,
  UsagersFilterCriteriaDernierPassage,
  UsagersFilterCriteriaEcheance,
} from "@domifa/common";

@Component({
  selector: "app-manage-filters",
  templateUrl: "./manage-filters.component.html",
  styleUrls: ["../manage-usagers-page/manage-usagers-page.component.scss"],
})
export class ManageFiltersComponent {
  @Input() public filters: UsagersFilterCriteria;
  @Input() public usagersRadiesLoadedCount: number;
  @Input() public usagersRadiesTotalCount: number;
  @Input() public nbResults: number;

  @Output() public readonly updateFilters = new EventEmitter();

  public readonly labelsEcheance =
    extractDeadlines<UsagersFilterCriteriaEcheance>([
      "EXCEEDED",
      "NEXT_TWO_WEEKS",
      "NEXT_TWO_MONTHS",
      "PREVIOUS_YEAR",
      "PREVIOUS_TWO_YEARS",
    ]);

  public readonly labelsEcheanceRadiation =
    extractDeadlines<UsagersFilterCriteriaEcheance>([
      "PREVIOUS_YEAR",
      "PREVIOUS_TWO_YEARS",
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
  public sortMenuItems = this.getSortKeys();

  public getSortKeys() {
    const sortElements = [
      { id: "ID", label: "ID" },
      { id: "NAME", label: "nom" },
      { id: "ECHEANCE", label: this.getEcheanceLabel() },
    ];

    if (this.filters?.statut === "TOUS" || this.filters?.statut === "VALIDE") {
      sortElements.push({ id: "PASSAGE", label: "dernier passage" });
    }

    return sortElements;
  }

  public getEcheanceLabel(): "radiation" | "refus" | "échéance" {
    if (this.filters?.statut === "RADIE") {
      return "radiation";
    } else if (this.filters?.statut === "REFUS") {
      return "refus";
    }
    return "échéance";
  }
}
