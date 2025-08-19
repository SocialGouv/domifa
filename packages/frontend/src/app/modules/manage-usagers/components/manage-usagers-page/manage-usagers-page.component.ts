import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";

import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
  merge,
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
import {
  fadeInOut,
  selectAllUsagers,
  selectUsagerStateData,
  UsagerState,
} from "../../../../shared";

import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { Store } from "@ngrx/store";
import { ManageUsagersService } from "../../services/manage-usagers.service";
import {
  CriteriaSearchField,
  parseBirthDate,
  SortValues,
  UsagersFilterCriteriaStatut,
  UserStructure,
  UsagersCountByStatus,
} from "@domifa/common";
import { MatomoTracker } from "ngx-matomo-client";
import { AuthService, CustomToastService } from "../../../shared/services";
import { UsagerLight } from "../../../../../_common/model";
import {
  UsagersFilterCriteria,
  UsagersFilterCriteriaSortKey,
} from "../../classes";
import {
  calculateUsagersCountByStatus,
  usagersFilter,
  usagersSorter,
} from "../../services/usager-filter";

const FIVE_MINUTES = 5 * 60 * 1000;
const STORAGE_KEY = "SEARCH";
@Component({
  animations: [fadeInOut],
  selector: "app-manage-usagers-page",
  styleUrls: ["./manage-usagers-page.component.scss"],
  templateUrl: "./manage-usagers-page.component.html",
})
export class ManageUsagersPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  public searching: boolean;

  public usagersRadiesLoadedCount = 0;
  public readonly CriteriaSearchField = CriteriaSearchField;

  public chargerTousRadies$ = new BehaviorSubject(false);
  public searchTrigger$ = new Subject<void>();

  @ViewChild("sentinel") sentinel!: ElementRef;
  private observer!: IntersectionObserver;

  public readonly UsagersFilterCriteriaStatut = UsagersFilterCriteriaStatut;
  public usagersCountByStatus = new UsagersCountByStatus();

  private readonly destroy$ = new Subject<void>();

  public usagers: UsagerFormModel[] = [];
  public filteredUsagers: UsagerFormModel[] = [];

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
    BIRTH_DATE: {
      label: "Date de naissance (format attendu:  JJ/MM/AAAA)",
      placeholder: "Recherche par date de naissance JJ/MM/AAAA",
    },
    PHONE_NUMBER: {
      label: "Numéro de téléphone",
      placeholder: "Recherche par numéro de téléphone",
    },
  };

  public filters: UsagersFilterCriteria;
  public filters$: Subject<UsagersFilterCriteria> = new ReplaySubject(1);

  public nbResults: number;
  public needToPrint: boolean;

  public pageSize: number;

  @ViewChild("searchInput", { static: true })
  public searchInput!: ElementRef;

  @ViewChild("refreshButton", { static: true })
  refreshButton!: ElementRef;

  private readonly subscription = new Subscription();
  public selectedRefs: Set<number> = new Set();
  public selectAllCheckboxes = false;

  constructor(
    private readonly usagerService: ManageUsagersService,
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly store: Store<UsagerState>,
    private readonly matomo: MatomoTracker,
    private readonly toastr: CustomToastService // private readonly tallyService: TallyService
  ) {
    this.me = this.authService.currentUserValue;
    this.nbResults = 0;
    this.needToPrint = false;
    this.searching = true;
    this.usagers = [];
    this.filters = new UsagersFilterCriteria(this.getFilters());
    this.pageSize = 50;
    this.filters.page = 1;
    this.titleService.setTitle("Gestion des domiciliés - DomiFa");
    this.filters$.next(this.filters);
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();

    if (this.sentinel) {
      this.observer.observe(this.sentinel.nativeElement);
    }
  }

  public ngOnInit(): void {
    if (!this.me?.acceptTerms) {
      return;
    }

    // this.tallyService.openTally(this.me);

    this.searchInput.nativeElement.value = this.filters.searchString;

    const inputChange$ = fromEvent<InputEvent>(
      this.searchInput.nativeElement,
      "input"
    ).pipe(
      debounceTime(300),
      map((event: InputEvent) => {
        return (event.target as HTMLInputElement).value;
      })
    );

    const enterPress$ = fromEvent<KeyboardEvent>(
      this.searchInput.nativeElement,
      "keyup"
    ).pipe(
      filter((event) => event.key === "Enter"),
      map(() => this.searchInput.nativeElement.value)
    );

    const buttonClick$ = fromEvent(
      this.refreshButton.nativeElement,
      "click"
    ).pipe(map(() => this.searchInput.nativeElement.value));

    const manualSearchTrigger$ = this.searchTrigger$.pipe(
      map(() => this.searchInput.nativeElement.value)
    );

    const searchEvents$ = merge(
      inputChange$,
      enterPress$,
      buttonClick$,
      manualSearchTrigger$
    ).pipe(
      withLatestFrom(this.chargerTousRadies$),
      switchMap(([searchString, chargerTousRadies]) => {
        this.filters.searchString = searchString ?? null;
        return this.findRemoteUsagers(chargerTousRadies, {
          ...this.filters,
          searchString,
        });
      }),
      tap((searchString: string) => {
        this.searching = true;
        this.filters.searchString = searchString ?? null;
        this.filters.page = 1;
        this.filters$.next(this.filters);
      })
    );

    this.subscription.add(searchEvents$.subscribe());

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
      this.chargerTousRadies$
        .pipe(
          filter((chargerTousRadies) => chargerTousRadies === true),
          switchMap((chargerTousRadies) =>
            this.usagerService
              .fetchSearchPageUsagerData({ chargerTousRadies })
              .pipe(
                switchMap(() =>
                  this.findRemoteUsagers(chargerTousRadies, this.filters)
                )
              )
          ),
          takeUntil(this.destroy$)
        )
        .subscribe()
    );

    this.subscription.add(
      this.store
        .select(selectUsagerStateData())
        .pipe(
          switchMap(({ dataLoaded, usagersRadiesTotalCount }) => {
            if (!dataLoaded) {
              return this.loadDataFromAPI().pipe(
                switchMap(() =>
                  combineLatest([
                    this.filters$,
                    this.store.select(selectAllUsagers),
                  ]).pipe(
                    map(([filters, usagers]) => ({
                      filters,
                      usagers,
                      usagersRadiesTotalCount,
                    }))
                  )
                )
              );
            }

            return combineLatest([
              this.filters$,
              this.store.select(selectAllUsagers),
            ]).pipe(
              map(([filters, usagers]) => {
                return {
                  filters,
                  usagers,
                  usagersRadiesTotalCount,
                };
              })
            );
          }),
          takeUntil(this.destroy$)
        )
        .subscribe(({ filters, usagers, usagersRadiesTotalCount }) => {
          if (filters && usagers) {
            this.setFilters();
            this.countRadiesLoaded(usagers);
            this.usagersCountByStatus = calculateUsagersCountByStatus(
              usagers,
              usagersRadiesTotalCount
            );
            this.applyFilters({ filters, allUsagers: usagers });
          }
          this.searching = false;
        })
    );
  }

  private setupIntersectionObserver(): void {
    const viewportHeight = window.innerHeight;
    const rootMargin = Math.floor(viewportHeight * 0.5) + "px";

    const options = {
      root: null,
      rootMargin,
      threshold: 0,
    };

    this.observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && this.usagers.length < this.nbResults) {
        this.filters.page = this.filters.page + 1;
        this.applyPagination();
      }
    }, options);
  }

  public launchSearch() {
    this.filters$.next(this.filters);
  }

  private loadDataFromAPI() {
    return this.chargerTousRadies$.pipe(
      tap(() => {
        this.searching = true;
      }),
      switchMap((chargerTousRadies) => {
        return this.usagerService.fetchSearchPageUsagerData({
          chargerTousRadies,
        });
      }),
      switchMap(() => this.chargerTousRadies$),
      switchMap((chargerTousRadies) =>
        this.findRemoteUsagers(chargerTousRadies, this.filters)
      )
    );
  }

  private findRemoteUsagers(
    chargerTousRadies: boolean,
    filters: UsagersFilterCriteria
  ): Observable<string> {
    if (
      this.usagersCountByStatus.RADIE !== this.usagersRadiesLoadedCount &&
      !chargerTousRadies &&
      (this.filters.statut === UsagersFilterCriteriaStatut.TOUS ||
        this.filters.statut === UsagersFilterCriteriaStatut.RADIE)
    ) {
      const formattedDate = parseBirthDate(filters?.searchString);

      if (this.filters.searchStringField === CriteriaSearchField.BIRTH_DATE) {
        if (!formattedDate) {
          return of(filters.searchString);
        } else {
          filters.searchString = formattedDate;
        }
      }

      return this.usagerService
        .getSearchPageRemoteSearchRadies(this.filters)
        .pipe(
          catchError(() => {
            this.searching = false;
            this.toastr.error(
              "La recherche n'a pas abouti, merci de réessayer dans quelques instants"
            );
            return filters.searchString;
          })
        );
    }
    return of(filters.searchString);
  }

  public chargerTousRadies(): void {
    this.searching = true;
    this.matomo.trackEvent(
      "MANAGE",
      "CHARGER_RADIES",
      this.me.structure.nom,
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
    this.filters.page = 1;
    this.needToPrint = true;
    this.filters$.next(this.filters);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
    if (this.observer) {
      this.observer.disconnect();
    }
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
    sortValue?: SortValues;
  }): void {
    const filtersToToggle = [
      "echeance",
      "interactionType",
      "lastInteractionDate",
      "entretien",
    ];
    if (!element) {
      return;
    }

    if (element === "page") {
      this.filters.page = parseInt(value as string, 10);
      this.applyPagination();
      return;
    }

    if (element === "sortKey") {
      this.filters.sortValue = sortValue || this.getNextSortValue(value);
      this.filters.sortKey = value as UsagersFilterCriteriaSortKey;
      this.filters.page = 1;
      this.applySorting();
      return;
    }

    if (element === "statut" && this.filters[element] !== value) {
      this.resetFiltersInStatus();
      this.filters[element] = value;
      this.setSortKeyAndValue("NOM", this.filters.sortValue);
    } else if (filtersToToggle.includes(element)) {
      this.filters[element] = this.filters[element] === value ? null : value;
      this.setSortKeyAndValue("NOM", "asc");
    }
    // Undefined, because null can be a value for referrerId
    else if (element === "referrerId") {
      this.filters[element] =
        this.filters[element] === value ? undefined : value;
    } else {
      this.filters[element] = value;
    }
    this.filters.page = 1;

    const elementsForRemoteSearch = [
      "echeance",
      "lastInteractionDate",
      "referrerId",
    ];

    const statusForRemoteSearch = [
      UsagersFilterCriteriaStatut.TOUS,
      UsagersFilterCriteriaStatut.RADIE,
    ];

    const shouldTriggerRemoteSearch =
      elementsForRemoteSearch.includes(element) &&
      statusForRemoteSearch.includes(this.filters.statut);

    if (shouldTriggerRemoteSearch) {
      this.searchTrigger$.next();
    } else {
      this.filters$.next(this.filters);
    }
    this.setFilters();
  }

  private getNextSortValue(
    value: UsagersFilterCriteria[keyof UsagersFilterCriteria]
  ): SortValues {
    const isCurrentSortKey = value === this.filters.sortKey;
    const isAscendingSort = this.filters.sortValue === "asc";
    return isCurrentSortKey && isAscendingSort ? "desc" : "asc";
  }

  public applyFilters({
    filters,
    allUsagers,
  }: {
    filters: UsagersFilterCriteria;
    allUsagers: UsagerLight[];
  }): void {
    this.searching = true;

    this.resetCheckboxes();

    this.filteredUsagers = usagersFilter.filter(allUsagers, {
      criteria: filters,
    }) as UsagerFormModel[];

    this.nbResults = this.filteredUsagers.length;

    this.applySorting();

    // Impression: on attend la fin de la génération de la liste
    if (this.needToPrint) {
      setTimeout(() => {
        window.print();
        this.needToPrint = false;
      }, 1500);
    }
  }

  private resetFiltersInStatus(): void {
    this.filters.lastInteractionDate = null;
    this.filters.entretien = null;
    this.filters.echeance = null;
    this.filters.interactionType = null;
  }

  public countRadiesLoaded = (
    allUsagers: Pick<UsagerLight, "statut">[]
  ): void => {
    let radiesCount = 0;
    for (const usager of allUsagers) {
      if (usager.statut === "RADIE") {
        radiesCount++;
      }
    }

    this.usagersRadiesLoadedCount = radiesCount;
  };

  private applySorting(): void {
    if (!this.filteredUsagers.length) {
      this.usagers = [];
      return;
    }

    this.filteredUsagers = usagersSorter.sortBy(this.filteredUsagers, {
      sortKey: this.filters.sortKey,
      sortValue: this.filters.sortValue,
    }) as UsagerFormModel[];

    this.setFilters();
    this.applyPaginationFromStore();
  }

  private applyPaginationFromStore(): void {
    if (!this.filteredUsagers?.length) {
      return;
    }

    const startIndex = 0;
    const endIndex = this.filters.page * this.pageSize;

    this.usagers = this.filteredUsagers.slice(startIndex, endIndex);
  }

  private applyPagination(): void {
    if (!this.filteredUsagers?.length) {
      return;
    }

    const startIndex = (this.filters.page - 1) * this.pageSize;
    const endIndex = this.filters.page * this.pageSize;

    const newElements = this.filteredUsagers.slice(startIndex, endIndex);

    if (this.filters.page === 1) {
      this.usagers = newElements;
    } else {
      this.usagers = [...this.usagers, ...newElements];
    }
  }

  private setSortKeyAndValue(
    sortKey: UsagersFilterCriteriaSortKey,
    sortValue: SortValues
  ): void {
    this.filters.sortKey = sortKey;
    this.filters.sortValue = sortValue;
  }

  private setFilters() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.filters));
  }

  private getFilters(): null | Partial<UsagersFilterCriteria> {
    const filters = localStorage.getItem(STORAGE_KEY);
    return filters === null ? {} : JSON.parse(filters);
  }

  private resetCheckboxes() {
    this.selectAllCheckboxes = false;
    this.selectedRefs.clear();
  }
}
