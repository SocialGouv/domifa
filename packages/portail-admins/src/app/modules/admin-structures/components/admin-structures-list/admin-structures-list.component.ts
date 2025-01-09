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
import { AdminStructuresApiClient } from "../../../shared/services";
import { structuresListModelBuilder, structuresSorter } from "./services";
import { structuresFilter } from "./services/structuresFilter.service";
import { ApiStructureAdmin, StructureAdmin } from "../../types";
import { Search, SortValues } from "@domifa/common";
import { fadeInOut } from "../../../shared/constants";

@Component({
  animations: [fadeInOut],
  selector: "app-admin-structures-list",
  templateUrl: "./admin-structures-list.component.html",
  styleUrls: ["./admin-structures-list.component.scss"],
})
export class AdminStructuresListComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  public allstructures$ = new ReplaySubject<StructureAdmin[]>(1);
  public structures: StructureAdmin[] = [];
  public filteredStructures: StructureAdmin[] = [];

  private subscription = new Subscription();
  public searching = true;
  public totalStructures = 0;
  public filters = new Search({
    sortKey: "id",
  });

  public pageSize = 100;

  public filters$: BehaviorSubject<Search> = new BehaviorSubject(this.filters);

  @ViewChild("searchInput", { static: true })
  public searchInput!: ElementRef;

  @ViewChild("sentinel") sentinel!: ElementRef;
  private observer!: IntersectionObserver;

  constructor(
    private readonly adminStructuresApiClient: AdminStructuresApiClient,
    private readonly titleService: Title
  ) {
    this.titleService.setTitle("Liste des structures");
    this.filters = new Search(this.getFilters());
    this.filters.sortKey = "id";
  }

  ngAfterViewInit() {
    if (this.sentinel) {
      this.observer.observe(this.sentinel.nativeElement);
    }
  }

  public ngOnInit(): void {
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
      this.adminStructuresApiClient
        .getAdminStructureListData()
        .subscribe((structures: ApiStructureAdmin[]) => {
          this.totalStructures = structures.length;
          this.allstructures$.next(
            structuresListModelBuilder.buildStructuresViewModel(structures)
          );
        })
    );

    this.subscription.add(
      combineLatest([this.allstructures$, this.filters$]).subscribe(
        ([allstructures, filters]) => {
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

  private applyPagination(): void {
    if (!this.filteredStructures?.length) {
      return;
    }

    const startIndex = (this.filters.page - 1) * this.pageSize;
    const endIndex = this.filters.page * this.pageSize;

    const newElements = this.filteredStructures.slice(
      startIndex,
      endIndex
    ) as StructureAdmin[];

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
    this.filters.sortKey = name as keyof StructureAdmin;
    this.filters.page = 1;
    this.applySorting();

    return;
  }

  public applyFilters({
    filters,
    structures,
  }: {
    filters: Search;
    structures: StructureAdmin[];
  }): void {
    const filterCriteria: Search = {
      ...filters,
    };

    this.searching = false;

    this.filteredStructures = structuresFilter.filter(structures, {
      criteria: filterCriteria,
    });

    this.applySorting();
  }

  private getNextSortValue(value: keyof StructureAdmin): SortValues {
    const isCurrentSortKey = value === this.filters.sortKey;
    const isAscendingSort = this.filters.sortValue === "asc";
    return isCurrentSortKey && isAscendingSort ? "desc" : "asc";
  }
  private applySorting(): void {
    if (!this.filteredStructures.length) {
      this.filteredStructures = [];
      return;
    }

    this.filteredStructures = structuresSorter.sortBy(this.filteredStructures, {
      sortKey: this.filters.sortKey,
      sortValue: this.filters.sortValue,
    }) as StructureAdmin[];

    this.applyPaginationFromStore();
  }

  private applyPaginationFromStore(): void {
    if (!this.filteredStructures?.length) {
      return;
    }

    const startIndex = 0;
    const endIndex = this.filters.page * this.pageSize;

    this.structures = this.filteredStructures.slice(
      startIndex,
      endIndex
    ) as StructureAdmin[];
  }

  private setFilters() {
    localStorage.setItem("ADMIN", JSON.stringify(this.filters));
  }

  private getFilters(): null | Partial<Search> {
    const filters = localStorage.getItem("ADMIN");
    return filters === null ? {} : JSON.parse(filters);
  }
}
