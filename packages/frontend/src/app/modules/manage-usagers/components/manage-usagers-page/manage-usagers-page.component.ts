import { CriteriaSearchField } from "../usager-filter/UsagersFilterCriteria";

import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";

import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
  Observable,
  of,
  ReplaySubject,
  Subject,
  Subscription,
  timer,
} from "rxjs";
import { debounceTime, filter, map, switchMap, tap } from "rxjs/operators";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerLight } from "../../../../../_common/model";
import {
  fadeInOut,
  selectSearchPageLoadedUsagersData,
} from "../../../../shared";
import { SearchPageLoadedUsagersData } from "../../../../shared/store/AppStoreModel.type";

import { UsagerFormModel } from "../../../usager-shared/interfaces";

import {
  UsagersByStatus,
  usagersByStatusBuilder,
  usagersFilter,
  UsagersFilterCriteria,
  UsagersFilterCriteriaSortKey,
  UsagersFilterCriteriaSortValues,
} from "../usager-filter";
import { select, Store } from "@ngrx/store";
import { ManageUsagersService } from "../../services/manage-usagers.service";
import { UserStructure } from "@domifa/common";
import { MatomoTracker } from "ngx-matomo-client";

const AUTO_REFRESH_PERIOD = 600000; // 10 minutes

@Component({
  animations: [fadeInOut],
  selector: "app-manage-usagers-page",
  styleUrls: ["./manage-usagers-page.component.scss"],
  templateUrl: "./manage-usagers-page.component.html",
})
export class ManageUsagersPageComponent implements OnInit, OnDestroy {
  public searching: boolean;
  public searchPageLoadedUsagersData$ =
    new BehaviorSubject<SearchPageLoadedUsagersData>({
      usagersNonRadies: [],
      usagersRadiesFirsts: [],
      usagersRadiesTotalCount: 0,
      dataLoaded: false,
    });

  public usagersTotalCount = 0;
  public usagersRadiesLoadedCount = 0;
  public usagersRadiesTotalCount = 0;

  public displayCheckboxes: boolean;
  public chargerTousRadies$ = new BehaviorSubject(false);

  public allUsagers$ = this.searchPageLoadedUsagersData$.pipe(
    map((data: SearchPageLoadedUsagersData): UsagerLight[] => {
      if (!data) {
        return [];
      }
      return data.usagersNonRadies.concat(data.usagersRadiesFirsts);
    })
  );

  public allUsagersByStatus$ = new ReplaySubject<UsagersByStatus>(1);
  public allUsagersByStatus: UsagersByStatus;
  public usagers: UsagerFormModel[] = [];
  public me!: UserStructure | null;

  public readonly SEARCH_STRING_FIELD_LABELS: {
    [key in CriteriaSearchField]: {
      label: string;
      placeholder: string;
    };
  } = {
    DEFAULT: {
      label: "ID, nom, prénom, ayant-droit ou mandataire",
      placeholder: "Recherche par ID, nom, prénom, ayant-droit ou mandataire",
    },
    DATE_NAISSANCE: {
      label: "Date de naissance",
      placeholder: "Recherche par date de naissance JJ/MM/AAAA",
    },
  };

  public filters: UsagersFilterCriteria;
  public filters$: Subject<UsagersFilterCriteria> = new ReplaySubject(1);

  public nbResults: number;
  public needToPrint: boolean;

  public pageSize: number;

  @ViewChild("searchInput", { static: true })
  public searchInput!: ElementRef;

  private subscription = new Subscription();
  public selectedRefs: number[];

  constructor(
    private readonly usagerService: ManageUsagersService,
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly store: Store,
    private readonly matomo: MatomoTracker
  ) {
    this.selectedRefs = [];
    this.displayCheckboxes = false;

    this.allUsagersByStatus = {
      INSTRUCTION: [],
      VALIDE: [],
      ATTENTE_DECISION: [],
      REFUS: [],
      RADIE: [],
      TOUS: [],
    };

    this.me = this.authService.currentUserValue;

    this.nbResults = 0;
    this.needToPrint = false;
    this.searching = true;
    this.usagers = [];
    this.filters = new UsagersFilterCriteria(this.getFilters());

    this.pageSize = 50;
    this.filters.page = 0;
    this.titleService.setTitle("Gestion des domiciliés - DomiFa");
  }

  public ngOnInit(): void {
    if (!this.me?.acceptTerms) {
      return;
    }

    this.searchInput.nativeElement.value = this.filters.searchString;

    // 1. We load data from API
    this.subscription.add(
      timer(0, AUTO_REFRESH_PERIOD)
        .pipe(
          tap(() => {
            this.searching = true;
          }),
          switchMap(() => this.chargerTousRadies$),
          switchMap((chargerTousRadies) => {
            this.searching = true;

            return this.usagerService.getSearchPageUsagerData({
              chargerTousRadies,
            });
          })
        )
        .subscribe()
    );

    // 2. Subscribe to ngRx store
    this.subscription.add(
      this.store
        .pipe(
          select(selectSearchPageLoadedUsagersData()),
          filter((state: SearchPageLoadedUsagersData) => state.dataLoaded)
        )
        .subscribe(
          (searchPageLoadedUsagersData: SearchPageLoadedUsagersData) => {
            this.usagersRadiesTotalCount =
              searchPageLoadedUsagersData.usagersRadiesTotalCount;
            this.usagersTotalCount =
              searchPageLoadedUsagersData.usagersRadiesTotalCount +
              searchPageLoadedUsagersData.usagersNonRadies.length;
            this.usagersRadiesLoadedCount =
              searchPageLoadedUsagersData.usagersRadiesFirsts.length;
            this.searchPageLoadedUsagersData$.next(searchPageLoadedUsagersData);
            this.filters$.next(this.filters);
          }
        )
    );

    this.subscription.add(
      this.allUsagers$.subscribe((allUsagers: UsagerLight[]) => {
        this.allUsagersByStatus = usagersByStatusBuilder.build(allUsagers);
        this.allUsagersByStatus$.next(this.allUsagersByStatus);
      })
    );

    const onSearchInputKeyUp$: Observable<string> = fromEvent<InputEvent>(
      this.searchInput.nativeElement,
      "input"
    ).pipe(
      map((event: InputEvent) => (event.target as HTMLInputElement).value),
      debounceTime(200),
      map((value: string) => value.trim()),
      filter((value: string) => value !== this.filters.searchString),
      switchMap((searchString: string) => {
        if (
          searchString.length > 3 &&
          (this.filters.statut === "TOUS" || this.filters.statut === "RADIE")
        ) {
          this.searching = true;
          return this.usagerService.getSearchPageRemoteSearchRadies({
            searchString,
          });
        }
        return of(searchString);
      }),
      tap((searchString: string) => {
        if (searchString !== null) {
          this.filters.searchString = searchString;
          this.filters.page = 0;
          this.filters$.next(this.filters);
        }
      })
    );

    this.subscription.add(
      onSearchInputKeyUp$.subscribe(() => {
        // Nothing to do, just subscribe
      })
    );

    this.subscription.add(
      combineLatest([this.filters$, this.allUsagersByStatus$]).subscribe(
        ([filters, allUsagersByStatus]) => {
          this.applyFilters({ filters, allUsagersByStatus });
        }
      )
    );
  }

  public chargerTousRadies(): void {
    this.matomo.trackEvent(
      "MANAGE",
      "CHARGER_RADIES",
      this.me.structure.nom + " - " + this.me.structure.nom,
      1
    );

    this.scrollTop();
    this.chargerTousRadies$.next(true);
  }

  private scrollTop(): void {
    window.scroll({
      behavior: "smooth",
      left: 0,
      top: 0,
    });
  }

  public goToPrint(): void {
    this.pageSize = 20000;
    this.filters.page = 0;
    this.needToPrint = true;
    this.filters$.next(this.filters);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public resetSearchBar(): void {
    this.searchInput.nativeElement.value = "";
    this.filters.searchString = null;
    this.filters$.next(this.filters);
    this.searchInput.nativeElement.focus();
  }

  public resetFilters(): void {
    this.filters = new UsagersFilterCriteria();
    this.resetSearchBar();
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
    if (!element) {
      return;
    }

    if (
      element === "interactionType" ||
      element === "passage" ||
      element === "echeance"
    ) {
      const newValue = this.filters[element] === value ? null : value;
      this.filters[element] = newValue;
      this.setSortKeyAndValue("NAME", "asc");
    } else if (element === "statut") {
      if (this.filters[element] === value) {
        return;
      }

      this.resetFiltersInStatus();

      this.filters[element] = value;
      if (
        (this.filters.sortKey !== "NAME" &&
          this.filters.sortKey !== "ID" &&
          this.filters.sortKey !== "PASSAGE") ||
        (value !== "TOUS" && value !== "VALIDE")
      ) {
        this.setSortKeyAndValue("NAME", this.filters.sortValue);
      }
    } else if (element === "sortKey") {
      if (
        this.filters.statut === "TOUS" &&
        (value === "VALIDE" || value === "TOUS")
      ) {
        return;
      }

      // Tri issu des en-tête de tableau
      if (!sortValue) {
        const isCurrentSortKey = value === this.filters.sortKey;
        const isAscendingSort = this.filters.sortValue === "asc";

        if (isCurrentSortKey) {
          sortValue = isAscendingSort ? "desc" : "asc";
        } else {
          sortValue = "asc";
        }
      }

      this.filters.sortValue = sortValue;
      this.filters.sortKey = value as UsagersFilterCriteriaSortKey;
    } else {
      this.filters[element] = value;
    }

    this.filters.page = 0;
    this.filters$.next(this.filters);
  }

  public applyFilters({
    filters,
    allUsagersByStatus,
  }: {
    filters: UsagersFilterCriteria;
    allUsagersByStatus: UsagersByStatus;
  }): void {
    this.searching = true;
    this.selectedRefs = [];

    this.displayCheckboxes = !(
      this.me?.role === "facteur" ||
      (this.me?.role === "simple" && this.filters.statut !== "VALIDE")
    );

    localStorage.setItem("MANAGE_USAGERS", JSON.stringify(filters));

    const filterCriteria: UsagersFilterCriteria = {
      ...filters,
      statut: null,
    };

    const filteredUsagers = usagersFilter.filter(
      allUsagersByStatus[filters.statut],
      {
        criteria: filterCriteria,
      }
    );

    this.nbResults = filteredUsagers.length;
    this.usagers = filteredUsagers.slice(
      0,
      filters.page === 0 ? this.pageSize : filters.page * this.pageSize
    ) as unknown as UsagerFormModel[];

    this.searching = false;

    // Impression: on attend la fin de la générationde la liste
    if (this.needToPrint) {
      setTimeout(() => {
        window.print();
        this.needToPrint = false;
      }, 1500);
    }
  }

  private resetFiltersInStatus(): void {
    this.filters.passage = null;
    this.filters.entretien = null;
    this.filters.echeance = null;
    this.filters.interactionType = null;
  }

  private setSortKeyAndValue(
    sortKey: UsagersFilterCriteriaSortKey,
    sortValue: UsagersFilterCriteriaSortValues
  ): void {
    this.filters.sortKey = sortKey;
    this.filters.sortValue = sortValue;
  }

  private getFilters(): null | Partial<UsagersFilterCriteria> {
    const filters = localStorage.getItem("MANAGE_USAGERS");
    return filters === null ? {} : JSON.parse(filters);
  }

  @HostListener("window:scroll", ["$event"])
  public onScroll(): void {
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
