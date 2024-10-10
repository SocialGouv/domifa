import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  ReplaySubject,
  Subscription,
} from "rxjs";
import { AdminStructuresApiClient } from "../../../shared/services";
import {
  AdminStructureSListFilterCriteria,
  AdminStructuresListSortAttribute,
  AdminStructuresListStructureModel,
} from "../../model";
import { structuresListModelBuilder } from "./services";
import { structuresFilter } from "./services/structuresFilter.service";
import { StructureAdmin } from "../../types";

@Component({
  selector: "app-admin-structures-list",
  templateUrl: "./admin-structures-list.component.html",
  styleUrls: ["./admin-structures-list.component.css"],
})
export class AdminStructuresListComponent implements OnInit, OnDestroy {
  public allStructuresVM$ = new ReplaySubject<
    AdminStructuresListStructureModel[]
  >(1);
  public allStructuresVM: AdminStructuresListStructureModel[] = [];

  public filteredStructuresVM: AdminStructuresListStructureModel[] = [];

  private subscription = new Subscription();

  public filters: AdminStructureSListFilterCriteria = {
    searchString: "",
    sortAttribute: {
      name: "id",
      asc: true,
    },
  };
  public filters$: BehaviorSubject<AdminStructureSListFilterCriteria> =
    new BehaviorSubject(this.filters);

  constructor(
    private readonly adminStructuresApiClient: AdminStructuresApiClient,
    private readonly titleService: Title
  ) {
    this.titleService.setTitle("Liste des structures");
  }

  public ngOnInit(): void {
    this.subscription.add(
      this.adminStructuresApiClient
        .getAdminStructureListData()
        .subscribe((structures: StructureAdmin[]) => {
          const structuresVM: AdminStructuresListStructureModel[] =
            structuresListModelBuilder.buildStructuresViewModel(structures);
          this.allStructuresVM = structuresVM;
          this.allStructuresVM$.next(structuresVM);
        })
    );
    this.subscription.add(
      combineLatest([
        this.allStructuresVM$,
        this.filters$.pipe(debounceTime(50)),
      ]).subscribe(([allStructuresVM, filters]) => {
        this.filteredStructuresVM = this.applyFilters({
          filters,
          structures: allStructuresVM,
        });
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public onSearchChange(event: any): void {
    this.updateSearch(event.target.value);
  }

  public updateSearch(searchString: string): void {
    this.filters = {
      ...this.filters,
      searchString,
    };
    this.filters$.next(this.filters);
  }

  public sortDashboard({
    name,
    defaultSort,
  }: {
    name: AdminStructuresListSortAttribute;
    defaultSort: "asc" | "desc";
  }): void {
    if (name !== this.filters$.value.sortAttribute.name) {
      this.filters$.next({
        ...this.filters$.value,
        sortAttribute: {
          name,
          asc: defaultSort === "asc",
        },
      });
    } else {
      this.filters$.next({
        ...this.filters$.value,
        sortAttribute: {
          name,
          asc: !this.filters$.value.sortAttribute.asc,
        },
      });
    }
  }

  public applyFilters({
    filters,
    structures,
  }: {
    filters: AdminStructureSListFilterCriteria;
    structures: AdminStructuresListStructureModel[];
  }): AdminStructuresListStructureModel[] {
    const filterCriteria: AdminStructureSListFilterCriteria = {
      ...filters,
    };
    return structuresFilter
      .filter(structures, {
        criteria: filterCriteria,
      })
      .slice(0, 50);
  }
}
