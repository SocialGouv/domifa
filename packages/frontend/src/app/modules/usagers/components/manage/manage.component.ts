import { HttpErrorResponse } from "@angular/common/http";
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import { MatomoTracker } from "ngx-matomo";

import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
  NEVER,
  ReplaySubject,
  Subject,
  Subscription,
  timer,
} from "rxjs";
import {
  catchError,
  debounceTime,
  delayWhen,
  distinctUntilChanged,
  map,
  retryWhen,
  switchMap,
  tap,
} from "rxjs/operators";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerLight, UserStructure } from "../../../../../_common/model";
import { fadeInOut } from "../../../../shared";
import { usagersCache } from "../../../../shared/store";
import { SearchPageLoadedUsagersData } from "../../../../shared/store/AppStoreModel.type";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import {
  getEcheanceInfos,
  getRdvInfos,
  getUrlUsagerProfil,
} from "../../../usager-shared/utils";
import { UsagerService } from "../../services/usager.service";
import {
  UsagersByStatus,
  usagersByStatusBuilder,
  usagersFilter,
  UsagersFilterCriteria,
  UsagersFilterCriteriaDernierPassage,
  UsagersFilterCriteriaEcheance,
  UsagersFilterCriteriaSortKey,
  UsagersFilterCriteriaSortValues,
  UsagersFilterCriteriaStatut,
} from "./usager-filter";

const AUTO_REFRESH_PERIOD = 3600000; // 1h
@Component({
  animations: [fadeInOut],

  selector: "app-manage-usagers",
  styleUrls: ["./manage.component.css"],
  templateUrl: "./manage.component.html",
})
export class ManageUsagersComponent implements OnInit, OnDestroy {
  public searching: boolean;
  public loading: boolean;

  public searchPageLoadedUsagersData$ =
    new BehaviorSubject<SearchPageLoadedUsagersData>(undefined);

  public usagersTotalCount = 0;
  public usagersRadiesLoadedCount = 0;
  public usagersRadiesTotalCount = 0;

  public chargerTousRadies$ = new BehaviorSubject(false);

  public allUsagers$ = this.searchPageLoadedUsagersData$.pipe(
    map((data: SearchPageLoadedUsagersData): UsagerLight[] => {
      if (!data) {
        return [];
      }

      const allUsagers = data.usagersNonRadies
        .concat(data.usagersRadiesFirsts)
        .map((usager) => {
          usager.echeanceInfos = getEcheanceInfos(usager);
          usager.rdvInfos = getRdvInfos(usager);
          usager.usagerProfilUrl = getUrlUsagerProfil(usager);
          return usager;
        });
      return allUsagers;
    })
  );

  public allUsagersByStatus$ = new ReplaySubject<UsagersByStatus>(1);
  public allUsagersByStatus: UsagersByStatus;
  public usagers: UsagerLight[] = [];
  public me!: UserStructure;

  public labelsDernierPassage: {
    [key in UsagersFilterCriteriaDernierPassage]: string;
  } = {
    DEUX_MOIS: "Dernier passage 2 mois",
    TROIS_MOIS: "Dernier passage 3 mois",
  };

  public labelsEcheance: { [key in UsagersFilterCriteriaEcheance]: string } = {
    DEUX_MOIS: "Fin dans 2 mois",
    DEUX_SEMAINES: "Fin dans 2 semaines",
    DEPASSEE: "Domiciliation expirée",
  };

  public labelsEntretien = {
    COMING: "à venir",
    OVERDUE: "date dépassée",
  };

  public searchString: string | null;
  public filters: UsagersFilterCriteria;
  public filters$: Subject<UsagersFilterCriteria> = new ReplaySubject(1);

  public nbResults: number;
  public needToPrint: boolean;
  public pageSize: number;

  @ViewChild("searchInput", { static: true })
  public searchInput!: ElementRef;

  private subscription = new Subscription();

  public sortLabel = "échéance";

  constructor(
    private usagerService: UsagerService,
    private authService: AuthService,
    private toastService: CustomToastService,
    private titleService: Title,
    public matomo: MatomoTracker
  ) {
    this.allUsagersByStatus = {
      INSTRUCTION: [],
      VALIDE: [],
      ATTENTE_DECISION: [],
      REFUS: [],
      RADIE: [],
      TOUS: [],
    };

    this.pageSize = 40;
    this.needToPrint = false;
    this.searching = false;
    this.loading = false;
    this.nbResults = 0;
    this.searchString = null;
    this.filters = new UsagersFilterCriteria();
  }

  public ngOnInit(): void {
    this.usagers = [];
    this.searching = true;
    this.nbResults = 0;

    this.filters = new UsagersFilterCriteria(this.getFilters());

    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    this.titleService.setTitle("Gérer vos domiciliés");

    this.searchString = this.filters.searchString;
    this.filters.page = 0;
    this.filters$.next(this.filters);

    // reload every hour
    this.subscription.add(
      timer(0, AUTO_REFRESH_PERIOD)
        .pipe(
          tap(() => {
            this.loading = true;
          }),
          switchMap(() => this.chargerTousRadies$),
          switchMap((chargerTousRadies) =>
            this.usagerService.getSearchPageUsagerData({
              chargerTousRadies,
            })
          ),
          retryWhen((errors) =>
            // retry in case of error
            errors.pipe(
              tap((err: HttpErrorResponse) => {
                this.loading = false;
                if (err?.status === 401) {
                  this.authService.logoutAndRedirect();
                } else {
                  console.log(`Error loading usagers`, err);
                  this.toastService.error(
                    "Une erreur a eu lieu lors de la recherche"
                  );
                }
              }),
              // retry in 30 seconds
              delayWhen(() => timer(30000))
            )
          )
        )
        .subscribe((searchPageLoadedUsagersData) => {
          this.loading = false;

          this.usagersRadiesTotalCount =
            searchPageLoadedUsagersData.usagersRadiesTotalCount;
          this.usagersTotalCount =
            searchPageLoadedUsagersData.usagersRadiesTotalCount +
            searchPageLoadedUsagersData.usagersNonRadies.length;
          this.usagersRadiesLoadedCount =
            searchPageLoadedUsagersData.usagersRadiesFirsts.length;
          this.searchPageLoadedUsagersData$.next(searchPageLoadedUsagersData);
          this.updateSortLabel();
        })
    );

    this.allUsagers$.subscribe((allUsagers: UsagerLight[]) => {
      this.allUsagersByStatus = usagersByStatusBuilder.build(allUsagers);
      this.allUsagersByStatus$.next(this.allUsagersByStatus);
    });

    const onSearchInputKeyUp$ = fromEvent(
      this.searchInput.nativeElement,
      "keyup"
    ).pipe(
      map((event: Event) => {
        return (event.target as HTMLInputElement).value;
      })
    );

    this.subscription.add(
      onSearchInputKeyUp$
        .pipe(
          debounceTime(50),
          map((filter: string) => (!filter ? filter : filter.trim())),
          distinctUntilChanged()
        )
        .subscribe((text: string) => {
          this.filters.searchString = text;
          this.filters.page = 0;
          this.filters$.next(this.filters);
        })
    );

    this.subscription.add(
      onSearchInputKeyUp$
        .pipe(
          debounceTime(500),
          switchMap((searchString: string) => {
            if (
              searchString?.trim().length > 3 &&
              (this.filters.statut === "TOUS" ||
                this.filters.statut === "RADIE")
            ) {
              return this.usagerService.getSearchPageRemoteSearchRadies({
                searchString,
              });
            }
            return NEVER;
          }),
          catchError(() => NEVER)
        )
        .subscribe(() => {
          // update data from cache
          this.searchPageLoadedUsagersData$.next(
            usagersCache.getSnapshot().searchPageLoadedUsagersData
          );
        })
    );

    this.subscription.add(
      combineLatest([
        this.filters$.pipe(
          tap((filters: UsagersFilterCriteria) => {
            if (filters.page === 0) {
              window.scroll({
                behavior: "smooth",
                left: 0,
                top: 0,
              });
            }
          })
        ),
        this.allUsagersByStatus$,
      ]).subscribe(([filters, allUsagersByStatus]) => {
        // setTimeout(() => {
        this.applyFilters({ filters, allUsagersByStatus });
        // }, 0);
      })
    );
  }

  public chargerTousRadies() {
    window.scroll({
      behavior: "auto",
      left: 0,
      top: 0,
    });
    this.chargerTousRadies$.next(true);
  }

  public goToPrint(): void {
    this.pageSize = 20000;
    this.filters.page = 0;
    this.needToPrint = true;
    this.filters$.next(this.filters);
    this.matomo.trackEvent(
      "MANAGE_USAGERS",
      "click",
      "Liste_Icône_Impression",
      1
    );
  }

  public updateUsager(usager: UsagerFormModel): void {
    this.searchPageLoadedUsagersData$.next({
      ...this.searchPageLoadedUsagersData$.value,
      usagersNonRadies:
        this.searchPageLoadedUsagersData$.value.usagersNonRadies.map((x) => {
          if (x.ref === usager.ref) {
            return usager;
          }
          return x;
        }),
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public resetSearchBar(): void {
    this.searchInput.nativeElement.value = "";
    this.filters.searchString = "";
    this.filters$.next(this.filters);
  }

  public resetFilters(): void {
    this.filters = new UsagersFilterCriteria();
    this.searchString = null;
    this.filters$.next(this.filters);
  }

  public getEcheanceLabel(): "radiation" | "refus" | "échéance" {
    if (this.filters.statut === "RADIE") {
      return "radiation";
    } else if (this.filters.statut === "REFUS") {
      return "refus";
    } else {
      return "échéance";
    }
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

  public updateFilters<T extends keyof UsagersFilterCriteria>({
    element,
    value,
    sortValue,
  }: {
    element: T;
    value: UsagersFilterCriteria[T] | null;
    sortValue?: UsagersFilterCriteriaSortValues;
  }): void {
    const statusType: { [key: string]: string } = {
      TOUS: "Liste_Tous",
      VALIDE: "Liste_Actifs",
      INSTRUCTION: "Liste_Compléter",
      ATTENTE_DECISION: "Liste_Attente_Décision",
      REFUS: "Liste_Refusés",
      RADIE: "Liste_Radiés",
    };
    const eventType: { [key: string]: string } = {
      passage: "Liste_Filtre_Passage",
      echeance: "Liste_Filtre_Échéance",
      interactionType: "Liste_Filtre_Échéance",
      sortKey: "Liste_Bouton_Tri",
    };
    const sortTypeButton: { [key: string]: string } = {
      ID: "Liste_Colonne_ID",
      NAME: "Liste_Colonne_Nom_Prénom",
      PASSAGE: "Li<ste_Colonne_Passage",
      ECHEANCE: "Liste_Colonne_Échéance",
    };

    let event = "";

    if (
      element === "interactionType" ||
      element === "passage" ||
      element === "echeance"
    ) {
      const newValue = this.filters[element] === value ? null : value;
      this.filters[element] = newValue;
      this.filters.sortKey = "NAME";
      this.filters.sortValue = "ascending";
      event = eventType[element];
    } else if (element === "statut") {
      event = statusType[value as UsagersFilterCriteriaStatut];
      if (this.filters[element] === value) {
        return;
      }

      this.filters[element] = value;

      // Si le tri actuel est lié sur le statut
      if (
        this.filters.sortKey !== "NAME" &&
        this.filters.sortKey !== "ID" &&
        this.filters.sortKey !== "PASSAGE"
      ) {
        this.filters.sortKey = "NAME";
      }

      if (value !== "TOUS" && value !== "VALIDE") {
        this.filters.passage = null;
        this.filters.echeance = null;
        this.filters.interactionType = null;
        this.filters.sortKey = "NAME";
        this.filters.sortValue = "ascending";
      }
    } else if (element === "sortKey") {
      if (!sortValue) {
        event = sortTypeButton[value as UsagersFilterCriteriaSortKey];
      } else {
        event = eventType[element];
      }
      if (
        this.filters.statut === "TOUS" &&
        (value === "VALIDE" || value === "TOUS")
      ) {
        return;
      }

      // Tri issu des en-tête de tableau
      if (!sortValue) {
        sortValue =
          value === this.filters.sortKey
            ? this.filters.sortValue === "ascending"
              ? "descending"
              : "ascending"
            : "ascending";
      }

      this.filters.sortValue = sortValue;
      this.filters.sortKey = value as UsagersFilterCriteriaSortKey;
    } else {
      this.filters[element] = value;
    }

    this.filters.page = 0;
    this.filters$.next(this.filters);

    if (event.length > 0) {
      this.matomo.trackEvent(
        "MANAGE_FILTERS",
        event as string,
        value as string,
        1
      );
    }
    this.updateSortLabel();
  }

  public applyFilters({
    filters,
    allUsagersByStatus,
  }: {
    filters: UsagersFilterCriteria;
    allUsagersByStatus: UsagersByStatus;
  }): void {
    this.searching = true;

    localStorage.setItem("filters", JSON.stringify(filters));

    const allUsagers = allUsagersByStatus[filters.statut];

    const filterCriteria: UsagersFilterCriteria = {
      ...filters,
      statut: undefined,
    };
    const filteredUsagers = usagersFilter.filter(allUsagers, {
      criteria: filterCriteria,
    });

    this.nbResults = filteredUsagers.length;
    if (filters.page === 0) {
      this.usagers = filteredUsagers
        .slice(0, this.pageSize)
        .map((item) => new UsagerFormModel(item, filters));
    } else {
      this.usagers = this.usagers.concat(
        filteredUsagers
          .slice(
            filters.page * this.pageSize,
            filters.page * this.pageSize + 40
          )
          .map((item) => new UsagerFormModel(item, filters))
      );
    }

    this.searching = false;

    // Impression: on attend la fin de la générationde la liste
    if (this.needToPrint) {
      setTimeout(() => {
        window.print();
        this.needToPrint = false;
      }, 1500);
    }
  }

  private getFilters(): null | Partial<UsagersFilterCriteria> {
    const filters = localStorage.getItem("filters");
    return filters === null ? {} : JSON.parse(filters);
  }

  @HostListener("window:scroll", ["$event"])
  onScroll(): void {
    const pos =
      (document.documentElement.scrollTop || document.body.scrollTop) +
      document.documentElement.offsetHeight;
    const max = document.documentElement.scrollHeight;
    const pourcent = (pos / max) * 100;

    if (pourcent >= 80 && this.usagers.length < this.nbResults) {
      this.filters.page = this.filters.page + 1;
      this.filters$.next(this.filters);
    }
  }
}
