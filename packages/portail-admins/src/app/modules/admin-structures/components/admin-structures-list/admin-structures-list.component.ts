import { ActivatedRoute } from "@angular/router";
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
  debounceTime,
  filter,
  fromEvent,
  map,
  merge,
  ReplaySubject,
  Subscription,
  tap,
} from "rxjs";

import { fadeInOut } from "../../../shared/constants";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import {
  StructureFilterCriteria,
  StructureFilterCriteriaSortEnum,
} from "../../utils/structure-filter-criteria";
import {
  DomiciliesSegmentEnum,
  SortValues,
  StructureType,
  StructureAdmin,
} from "@domifa/common";
import { structuresFilter, structuresSorter } from "../../utils";
import { appStore } from "../../../shared/store/appStore.service";

export type FilterOutput = {
  element: keyof StructureFilterCriteria;
  value: string;
  sortValue?: SortValues;
};

@Component({
  animations: [fadeInOut],
  selector: "app-admin-structures-list",
  templateUrl: "./admin-structures-list.component.html",
})
export class AdminStructuresListComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  public allstructures$ = new ReplaySubject<StructureAdmin[]>(1);
  public structures: StructureAdmin[] = [];
  public filteredStructures: StructureAdmin[] = [];
  private readonly subscription = new Subscription();
  public searching = true;
  public totalStructures = 0;
  public filters = new StructureFilterCriteria();
  public showFilters = false;
  public pageSize = 100;
  public readonly faSpinner = faSpinner;
  public filters$: BehaviorSubject<StructureFilterCriteria> =
    new BehaviorSubject(this.filters);

  @ViewChild("searchInput", { static: true })
  public searchInput!: ElementRef;

  @ViewChild("sentinel") sentinel!: ElementRef;
  private observer!: IntersectionObserver;

  constructor(
    private readonly titleService: Title,
    private readonly activatedRoute: ActivatedRoute
  ) {
    this.titleService.setTitle("Liste des structures");
    this.filters.sortKey = StructureFilterCriteriaSortEnum.ID;
  }

  ngAfterViewInit() {
    if (this.sentinel) {
      this.observer.observe(this.sentinel.nativeElement);
    }
  }

  public ngOnInit(): void {
    this.initFiltersFromStorage();
    this.subscription.add(
      this.activatedRoute.data.subscribe((data) => {
        this.structures = data.structureList ?? [];
        this.totalStructures = this.structures.length;
        this.allstructures$.next(this.structures);
      })
    );
    this.subscription.add(
      appStore.subscribe(() => {
        const state = appStore.getState();
        const structures = state?.structureListData;

        if (structures) {
          this.totalStructures = structures.length;
          this.allstructures$.next(structures);
        }
      })
    );

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

    const searchEvents$ = merge(inputChange$, enterPress$).pipe(
      tap((searchString: string) => {
        this.searching = true;
        this.filters.searchString = searchString ?? null;
        this.filters.page = 1;
        this.filters$.next(this.filters);
      })
    );

    this.subscription.add(searchEvents$.subscribe());

    this.subscription.add(
      combineLatest([this.allstructures$, this.filters$]).subscribe(
        ([allstructures, filters]) => {
          this.structures = allstructures;
          this.filters = filters;
          this.setFilters();
          this.applyFilters({
            filters,
            structures: allstructures,
          });
        }
      )
    );

    this.setupIntersectionObserver();
    this.filters$.next(this.filters);
    this.searchInput.nativeElement.value = this.filters.searchString;
  }

  private setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: "900px",
      threshold: 0,
    };
    this.observer = new IntersectionObserver((entries) => {
      const entry = entries[0];

      if (
        entry.isIntersecting &&
        this.structures.length < this.filteredStructures.length
      ) {
        this.filters.page = this.filters.page + 1;
        this.applyPagination();
      }
    }, options);
  }

  public toggleFilters() {
    this.showFilters = !this.showFilters;
  }
  private applyPagination(): void {
    if (!this.filteredStructures?.length) {
      return;
    }

    const startIndex = (this.filters.page - 1) * this.pageSize;
    const endIndex = this.filters.page * this.pageSize;

    const newElements = this.filteredStructures.slice(startIndex, endIndex);

    if (this.filters.page === 1) {
      this.structures = newElements;
    } else {
      this.structures = [...this.structures, ...newElements];
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public resetSearchBar(): void {
    this.searchInput.nativeElement.value = "";
    this.filters.searchString = "";
    this.filters$.next(this.filters);
    this.searchInput.nativeElement.focus();
  }

  public updateSearch(searchString: string): void {
    this.filters = {
      ...this.filters,
      searchString,
    };
    this.filters$.next(this.filters);
  }

  public sortDashboard(name: keyof StructureAdmin): void {
    this.filters.sortValue = this.getNextSortValue(name);
    this.filters.sortKey = name as StructureFilterCriteriaSortEnum;
    this.filters.page = 1;
    this.applySorting();
  }

  public updateFilters(filterOutput: FilterOutput): void {
    const { element, value, sortValue } = filterOutput;
    if (!element) {
      return;
    }

    if (element === "reset") {
      this.resetSearchBar();
      this.filters$.next(new StructureFilterCriteria());
      return;
    }

    if (element === "page") {
      this.filters.page = parseInt(value, 10);
      this.filters$.next(this.filters);
      this.applyPagination();
      return;
    }
    if (element === "sortKey") {
      this.filters.sortValue = sortValue || this.getNextSortValue(value);
      this.filters.sortKey = value as StructureFilterCriteriaSortEnum;
      this.filters.page = 1;
      this.filters$.next(this.filters);
      this.applySorting();
      return;
    }

    if (
      ["structureType", "region", "departement", "domicilieSegment"].includes(
        element
      )
    ) {
      this.updateAttributeFilters(element, value);
    }
  }

  public applyFilters({
    filters,
    structures,
  }: {
    filters: StructureFilterCriteria;
    structures: StructureAdmin[];
  }): void {
    this.searching = false;
    this.filteredStructures = structuresFilter.filter([...structures], {
      criteria: filters,
    });

    this.applySorting();
  }

  private getNextSortValue(
    value: StructureFilterCriteria[keyof StructureFilterCriteria]
  ): SortValues {
    const isCurrentSortKey = value === this.filters.sortKey;
    const isAscendingSort = this.filters.sortValue === "asc";
    return isCurrentSortKey && isAscendingSort ? "desc" : "asc";
  }

  private applySorting(): void {
    if (!this.filteredStructures.length) {
      this.filteredStructures = [];
    }

    this.structures = structuresSorter.sortBy(this.filteredStructures, {
      sortKey: this.filters.sortKey,
      sortValue: this.filters.sortValue,
    });

    this.applyPaginationFromStore();
  }

  private applyPaginationFromStore(): void {
    if (!this.structures?.length) {
      this.structures = [];
      return;
    }

    const startIndex = 0;
    const endIndex = this.filters.page * this.pageSize;

    this.structures = this.filteredStructures.slice(startIndex, endIndex);
  }

  private updateAttributeFilters(
    element: keyof StructureFilterCriteria,
    value
  ): void {
    if (element === "structureType" && value !== this.filters.structureType) {
      this.filters.structureType = value as StructureType;
    }

    if (element === "region" && value !== this.filters.region) {
      // departments filter depend on it so we rewrite the filters to trigger change detection
      // we also need to reset the department filter
      this.filters = {
        ...this.filters,
        region: value,
        departement: null,
      };
    }

    if (element === "departement" && value !== this.filters.departement) {
      this.filters.departement = value;
    }

    if (
      element === "domicilieSegment" &&
      value !== this.filters.domicilieSegment
    ) {
      this.filters.domicilieSegment = value as DomiciliesSegmentEnum;
    }
    this.filters$.next(this.filters);
  }

  private initFiltersFromStorage() {
    try {
      const storedFilters = localStorage.getItem("ADMIN");
      if (storedFilters) {
        const filters = JSON.parse(storedFilters) as StructureFilterCriteria;
        this.filters$.next(filters);
      }
    } catch {
      this.filters = new StructureFilterCriteria();
    }
  }

  private setFilters() {
    localStorage.setItem("ADMIN", JSON.stringify(this.filters));
  }
}
