import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { UsagersFilterCriteria } from "../usager-filter/UsagersFilterCriteria";
import { Subject, ReplaySubject, Subscription } from "rxjs";
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
export class ManageFiltersComponent implements OnInit, OnDestroy {
  @Input() public filters: UsagersFilterCriteria;
  @Input() public filters$: Subject<UsagersFilterCriteria> = new ReplaySubject(
    1
  );
  @Input() public usagersRadiesLoadedCount: number;
  @Input() public usagersRadiesTotalCount: number;
  @Input() public nbResults: number;

  @Output() public readonly updateFilters = new EventEmitter();

  private subscription = new Subscription();

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

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.filters$.subscribe(() => {
        this.sortMenuItems = this.getSortKeys();
        this.updateSortLabel();
      })
    );
  }

  public getEcheanceLabel(): "radiation" | "refus" | "échéance" {
    if (this.filters?.statut === "RADIE") {
      return "radiation";
    } else if (this.filters?.statut === "REFUS") {
      return "refus";
    }
    return "échéance";
  }

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

  private updateSortLabel(): void {
    const LABELS_SORT: { [key: string]: string } = {
      NAME: "nom",
      ATTENTE_DECISION: "demande effectuée le",
      ECHEANCE: this.getEcheanceLabel(),
      INSTRUCTION: "dossier débuté le",
      RADIE: "radié le ",
      REFUS: "date de refus",
      TOUS: "fin de domiciliation",
      VALIDE: "fin de domiciliation",
      PASSAGE: "date de dernier passage",
      ID: "ID",
    };

    this.sortLabel = LABELS_SORT[this.filters.sortKey];
    console.log(this.filters.sortKey);
  }
}
