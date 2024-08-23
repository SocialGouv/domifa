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
import {
  catchError,
  debounceTime,
  filter,
  map,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { fadeInOut } from "../../../../shared";

import { UsagerFormModel } from "../../../usager-shared/interfaces";

import {
  UsagersCountByStatus,
  usagersFilter,
  UsagersFilterCriteria,
  UsagersFilterCriteriaSortKey,
  UsagersFilterCriteriaSortValues,
} from "../usager-filter";
import { select, Store } from "@ngrx/store";
import { ManageUsagersService } from "../../services/manage-usagers.service";
import { UserStructure } from "@domifa/common";
import { MatomoTracker } from "ngx-matomo-client";
import { AuthService, CustomToastService } from "../../../shared/services";
import {} from "../../../../shared/store/usager-actions.service";
import {
  selectAllUsagers,
  selectUsagerStateData,
  UsagerState,
} from "../../../../shared/store/usager-actions-reducer.service";
import { UsagerLight } from "../../../../../_common/model";
import { calculateUsagersCountByStatus } from "../usager-filter/services";

const FIVE_MINUTES = 5 * 60 * 1000;

@Component({
  animations: [fadeInOut],
  selector: "app-manage-usagers-page",
  styleUrls: ["./manage-usagers-page.component.scss"],
  templateUrl: "./manage-usagers-page.component.html",
})
export class ManageUsagersPageComponent implements OnInit, OnDestroy {
  public searching: boolean;

  public usagersTotalCount = 0;
  public usagersRadiesLoadedCount = 0;

  public displayCheckboxes: boolean;
  public chargerTousRadies$ = new BehaviorSubject(false);

  public usagersCountByStatus: UsagersCountByStatus = {
    INSTRUCTION: 0,
    VALIDE: 0,
    ATTENTE_DECISION: 0,
    REFUS: 0,
    RADIE: 0,
    TOUS: 0,
  };

  private destroy$ = new Subject<void>();

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
    private readonly store: Store<UsagerState>,
    private readonly matomo: MatomoTracker,
    private readonly toastr: CustomToastService
  ) {
    this.selectedRefs = [];
    this.displayCheckboxes = false;

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

    const allUsagers$ = this.store.pipe(select(selectAllUsagers));

    this.searchInput.nativeElement.value = this.filters.searchString;

    const onSearchInputKeyUp$: Observable<string> = fromEvent<InputEvent>(
      this.searchInput.nativeElement,
      "input"
    ).pipe(
      map((event: InputEvent) => (event.target as HTMLInputElement).value),
      debounceTime(200),
      map((value: string) => value.trim()),
      filter((value: string) => value !== this.filters.searchString),
      withLatestFrom(this.chargerTousRadies$),
      switchMap(([searchString, chargerTousRadies]) => {
        return this.findRemoteUsagers(chargerTousRadies, searchString);
      }),
      tap((searchString: string) => {
        this.searching = true;
        this.filters.searchString = searchString ?? null;
        this.filters.page = 0;
        this.filters$.next(this.filters);
      })
    );

    this.subscription.add(onSearchInputKeyUp$.subscribe());

    this.subscription.add(
      timer(FIVE_MINUTES, FIVE_MINUTES)
        .pipe(
          tap(() => {
            this.searching = true;
          }),
          switchMap(() => this.usagerService.updateManage())
        )
        .subscribe(() => {
          this.searching = false;
          this.filters$.next(this.filters);
        })
    );

    this.subscription.add(
      combineLatest([this.filters$, allUsagers$])
        .pipe(debounceTime(200), takeUntil(this.destroy$))
        .subscribe(([filters, allUsagers]) => {
          this.applyFilters({ filters, allUsagers });
        })
    );

    this.subscription.add(
      combineLatest([
        this.store.select(selectUsagerStateData()),
        this.store.select(selectAllUsagers),
      ]).subscribe(([{ dataLoaded, usagersRadiesTotalCount }, usagers]) => {
        if (!dataLoaded) {
          this.loadDataFromAPI();
        } else {
          this.updateComponentState(usagers, usagersRadiesTotalCount);
        }
      })
    );
  }

  private loadDataFromAPI() {
    this.subscription.add(
      this.chargerTousRadies$
        .pipe(
          tap(() => {
            this.searching = true;
          }),
          switchMap((chargerTousRadies) =>
            this.usagerService.fetchSearchPageUsagerData({
              chargerTousRadies,
            })
          ),
          switchMap(() => this.chargerTousRadies$),
          switchMap((chargerTousRadies) =>
            this.findRemoteUsagers(chargerTousRadies, this.filters.searchString)
          )
        )
        .subscribe()
    );
  }

  private findRemoteUsagers(
    chargerTousRadies: boolean,
    searchString: string
  ): Observable<string> {
    if (
      !chargerTousRadies &&
      searchString?.length >= 3 &&
      (this.filters.statut === "TOUS" || this.filters.statut === "RADIE")
    ) {
      return this.usagerService
        .getSearchPageRemoteSearchRadies({
          searchString,
        })
        .pipe(
          catchError(() => {
            this.searching = false;
            this.toastr.error(
              "La recherche n'a pas abouti, merci de réessayer dans quelques instants"
            );
            return searchString;
          })
        );
    }
    return of(searchString);
  }

  private updateComponentState(
    usagers: UsagerLight[],
    usagersRadiesTotalCount: number
  ) {
    this.usagersCountByStatus = calculateUsagersCountByStatus(usagers);
    this.usagersCountByStatus.RADIE = usagersRadiesTotalCount;
    this.usagersCountByStatus.TOUS = usagers.length;
    this.usagersRadiesLoadedCount = usagers.filter(
      (usager) => usager.statut === "RADIE"
    ).length;

    this.filters$.next(this.filters);
  }

  public chargerTousRadies(): void {
    this.searching = true;
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
    this.destroy$.next();
    this.destroy$.complete();
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
    allUsagers,
  }: {
    filters: UsagersFilterCriteria;
    allUsagers: UsagerLight[];
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
    };

    const filteredUsagers = usagersFilter.filter(
      filters.statut !== "TOUS"
        ? allUsagers.filter((usager) => usager.statut === filters.statut)
        : allUsagers,
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

    if (pourcent >= 85 && this.usagers.length < this.nbResults) {
      this.filters.page = this.filters.page + 1;
      this.filters$.next(this.filters);
    }
  }
}
