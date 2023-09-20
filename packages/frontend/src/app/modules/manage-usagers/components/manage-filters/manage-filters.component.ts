import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  UsagersFilterCriteria,
  UsagersFilterCriteriaDernierPassage,
  UsagersFilterCriteriaEcheance,
} from "../usager-filter/UsagersFilterCriteria";
import { Subject, ReplaySubject, Subscription } from "rxjs";

@Component({
  selector: "app-manage-filters",
  templateUrl: "./manage-filters.component.html",
  styleUrls: ["../manage-usagers-page/manage-usagers-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageFiltersComponent implements OnInit, OnDestroy {
  @Input() public filters: UsagersFilterCriteria;
  @Input() public filters$: Subject<UsagersFilterCriteria> = new ReplaySubject(
    1
  );
  @Input() public usagersRadiesLoadedCount: number;
  @Input() public usagersRadiesTotalCount: number;
  @Input() public nbResults: number;

  @Output() public updateFilters = new EventEmitter();

  private subscription = new Subscription();

  public readonly labelsDernierPassage: {
    [key in UsagersFilterCriteriaDernierPassage]: string;
  } = {
    DEUX_MOIS: "Dernier passage 2 mois",
    TROIS_MOIS: "Dernier passage 3 mois",
  };

  public readonly labelsEcheance: {
    [key in UsagersFilterCriteriaEcheance]: string;
  } = {
    DEUX_MOIS: "Fin dans 2 mois",
    DEUX_SEMAINES: "Fin dans 2 semaines",
    DEPASSEE: "Domiciliation expirée",
  };

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
    } else {
      return "échéance";
    }
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

  private updateSortLabel() {
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
  }
}
