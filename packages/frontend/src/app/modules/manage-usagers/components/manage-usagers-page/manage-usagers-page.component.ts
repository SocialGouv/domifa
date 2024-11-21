import { CriteriaSearchField } from "../usager-filter/UsagersFilterCriteria";

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
import { fadeInOut } from "../../../../shared";

import { UsagerFormModel } from "../../../usager-shared/interfaces";

import {
  UsagersCountByStatus,
  usagersFilter,
  UsagersFilterCriteria,
  UsagersFilterCriteriaSortKey,
  UsagersFilterCriteriaSortValues,
} from "../usager-filter";
import { Store } from "@ngrx/store";
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
import {
  calculateUsagersCountByStatus,
  usagersSorter,
} from "../usager-filter/services";
import { isValid, parse } from "date-fns";

const FIVE_MINUTES = 5 * 60 * 1000;

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

  public chargerTousRadies$ = new BehaviorSubject(false);
  public searchTrigger$ = new Subject<void>();

  @ViewChild("sentinel") sentinel!: ElementRef;
  private observer!: IntersectionObserver;

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

  @ViewChild("refreshButton", { static: true })
  refreshButton!: ElementRef;

  private subscription = new Subscription();
  public selectedRefs: Set<number> = new Set();
  public selectAllCheckboxes = false;

  constructor(
    private readonly usagerService: ManageUsagersService,
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly store: Store<UsagerState>,
    private readonly matomo: MatomoTracker,
    private readonly toastr: CustomToastService
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
    if (this.sentinel) {
      this.observer.observe(this.sentinel.nativeElement);
    }
  }

  public ngOnInit(): void {
    if (!this.me?.acceptTerms) {
      return;
    }
    this.setupIntersectionObserver();

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
    const options = {
      root: null,
      rootMargin: "900px",
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
      (this.filters.statut === "TOUS" || this.filters.statut === "RADIE")
    ) {
      if (
        this.filters.searchStringField === "DATE_NAISSANCE" &&
        !this.validateDateSearchInput(filters?.searchString)
      ) {
        return of(filters.searchString);
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
      this.me.structure.nom + " - " + this.me.structure.nom,
      1
    );
    this.scrollTop();
    this.chargerTousRadies$.next(true);
  }

  private validateDateSearchInput(text: string): Date | null {
    const dateRegex = /\b(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/([12]\d{3})\b/;
    const match = text.match(dateRegex);

    if (!match) {
      return null;
    }
    const parsedDate = parse(match[0], "dd/MM/yyyy", new Date());
    return isValid(parsedDate) ? parsedDate : null;
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
    sortValue?: UsagersFilterCriteriaSortValues;
  }): void {
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
      this.setSortKeyAndValue("NAME", this.filters.sortValue);
    } else if (
      ["interactionType", "lastInteractionDate", "echeance"].includes(element)
    ) {
      this.filters[element] = this.filters[element] === value ? null : value;
      this.setSortKeyAndValue("NAME", "asc");
    } else {
      this.filters[element] = value;
    }
    this.filters.page = 1;
    const shouldTriggerRemoteSearch =
      (element === "echeance" || element === "lastInteractionDate") &&
      (this.filters.statut === "TOUS" || this.filters.statut === "RADIE");

    if (shouldTriggerRemoteSearch) {
      this.searchTrigger$.next();
    } else {
      this.filters$.next(this.filters);
    }
  }

  private getNextSortValue(
    value: UsagersFilterCriteria[keyof UsagersFilterCriteria]
  ): UsagersFilterCriteriaSortValues {
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
    localStorage.setItem("MANAGE_USAGERS", JSON.stringify(filters));

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
    this.resetCheckboxes();
    if (!this.filteredUsagers.length) {
      this.usagers = [];
      return;
    }

    this.filteredUsagers = usagersSorter.sortBy(this.filteredUsagers, {
      sortKey: this.filters.sortKey,
      sortValue: this.filters.sortValue,
    }) as UsagerFormModel[];

    this.applyPaginationFromStore();
  }

  private applyPaginationFromStore(): void {
    if (!this.filteredUsagers?.length) {
      return;
    }

    const startIndex = 0;
    const endIndex = this.filters.page * this.pageSize;

    this.usagers = this.filteredUsagers.slice(
      startIndex,
      endIndex
    ) as UsagerFormModel[];
  }

  private applyPagination(): void {
    if (!this.filteredUsagers?.length) {
      return;
    }

    const startIndex = (this.filters.page - 1) * this.pageSize;
    const endIndex = this.filters.page * this.pageSize;

    const newElements = this.filteredUsagers.slice(
      startIndex,
      endIndex
    ) as UsagerFormModel[];

    if (this.filters.page === 1) {
      this.usagers = newElements;
    } else {
      this.usagers = [...this.usagers, ...newElements];
    }
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

  private resetCheckboxes() {
    this.selectAllCheckboxes = false;
    this.selectedRefs.clear();
  }
}
