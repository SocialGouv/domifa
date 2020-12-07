import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import {
  BehaviorSubject,
  combineLatest,
  ReplaySubject,
  Subscription,
} from "rxjs";
import { map } from "rxjs/operators";
import { Structure } from "src/app/modules/structures/structure.interface";
import { interactionsLabelsPluriel } from "src/app/modules/usagers/interactions.labels";
import * as labels from "src/app/modules/usagers/usagers.labels";
import {
  departements,
  DepartementsLabels,
  RegionsLabels,
  REGIONS_LABELS_MAP,
} from "src/app/shared";
import { dataCompare } from "src/app/shared/dataCompare.service";
import { StatsService } from "../../stats.service";

export type DashboardTableStructure = Pick<
  Structure,
  | "_id"
  | "nom"
  | "ville"
  | "structureType"
  | "verified"
  | "structureType"
  | "createdAt"
  | "import"
  | "importDate"
  | "lastLogin"
  | "region"
  | "departement"
  | "stats"
  | "email"
> & {
  structureTypeLabel: string;
  regionLabel: string;
  departementLabel: string;
  usagersValideCount: number;
  usersCount: number;
};

type DashboardTableSortAttribute =
  | "nom"
  | "structureTypeLabel"
  | "createdAt"
  | "import"
  | "importDate"
  | "domicilies"
  | "usersCount"
  | "usagersValideCount"
  | "lastLogin"
  | "regionLabel"
  | "departementLabel";

type UsagersValide = { [structureId: string]: number };

@Component({
  selector: "app-dashboard",
  styleUrls: ["./dashboard.component.css"],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit, OnDestroy {
  public interactionsLabels: any;
  public structures$ = new ReplaySubject<Structure[]>(1);
  public usagersValide$ = new ReplaySubject<UsagersValide>(1);
  public sortAttribute$ = new BehaviorSubject<{
    name: DashboardTableSortAttribute;
    asc: boolean;
  }>({
    name: "nom",
    asc: false,
  });
  public sortedTableStructures: DashboardTableStructure[];

  public usagers: any;

  public interactions: any;
  public allInteractions: any;

  public users: number;
  public docs: number;
  public usersByStructure: any;

  public nbStructures: number;
  public structuresType: any;
  public structuresRegions: any;

  public labels: any;
  public todayStats: any;
  public exportLoading: boolean;

  public regions: RegionsLabels;
  public departements: DepartementsLabels;

  private subscription = new Subscription();

  public statutClass = {
    ATTENTE_DECISION: "text-warning",
    INSTRUCTION: "text-primary",
    RADIE: "text-danger",
    REFUS: "text-danger",
    VALIDE: "text-secondary",
  };

  constructor(
    public statsService: StatsService,
    private titleService: Title,
    private notifService: ToastrService
  ) {
    this.interactionsLabels = interactionsLabelsPluriel;
    this.labels = labels;
    this.regions = REGIONS_LABELS_MAP;
    this.departements = departements;

    this.docs = 0;
    this.users = 0;
    this.nbStructures = 0;

    this.sortedTableStructures = [];

    this.usagers = [];

    this.interactions = [];
    this.allInteractions = [];
    this.structuresType = [];
  }

  public ngOnInit() {
    this.titleService.setTitle("Dashboard de suivi");

    // Liste des structures
    this.statsService.getStructures().subscribe((structures: Structure[]) => {
      this.structures$.next(structures);
    });

    // Structures par type
    this.statsService
      .getStructuresByType()
      .subscribe((structuresType: any[]) => {
        this.structuresType = structuresType;
      });

    // Nombre d'utilisateurs total
    this.statsService.getUsers().subscribe((stats: number) => {
      this.users = stats;
    });

    this.statsService.getDocs().subscribe((stats: number) => {
      this.docs = stats;
    });

    this.statsService.getUsagers().subscribe((retour: any[]) => {
      this.usagers = retour;
    });

    this.statsService
      .getUsagersValide()
      .subscribe((usagersValide: UsagersValide) => {
        this.usagersValide$.next(usagersValide);
      });

    this.statsService
      .getStructuresByRegion()
      .subscribe((structuresRegions: any) => {
        this.structuresRegions = structuresRegions;
      });

    this.statsService.getInteractions().subscribe((stats: any[]) => {
      this.allInteractions = stats;
    });

    const sortedTableStructures$ = this.buildSortedTableStructures();

    this.subscription.add(
      sortedTableStructures$.subscribe((sortedTableStructures) => {
        this.sortedTableStructures = sortedTableStructures;
      })
    );
  }

  public exportDashboard() {
    this.exportLoading = true;
    this.statsService.exportDashboard().subscribe(
      (x: any) => {
        const newBlob = new Blob([x], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(newBlob, "export_stats_domifa" + ".xlsx");
        setTimeout(() => {
          this.exportLoading = false;
        }, 500);
      },
      (error: any) => {
        this.notifService.error(
          "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
        this.exportLoading = false;
      }
    );
  }

  private buildSortedTableStructures() {
    const tableStructures$ = combineLatest([
      this.structures$,
      this.usagersValide$,
    ]).pipe(
      map(([structures, usagersValide]) =>
        structures.map((structure) => {
          const tableStructure: DashboardTableStructure = {
            ...structure,
            structureTypeLabel: labels.structureType[structure.structureType],
            regionLabel: this.getRegionLabel(structure),
            departementLabel: this.getDepartementLabel(structure),
            usagersValideCount: usagersValide[structure.id] || 0,
            usersCount: structure.usersCount,
          };
          return tableStructure;
        })
      )
    );

    const sortedTableStructures$ = combineLatest([
      tableStructures$,
      this.sortAttribute$,
    ]).pipe(
      map(([tableStructures, sortAttribute]) => {
        const tableStructuresWithSortKey = tableStructures.map((ts) => {
          let sortKey: any;
          if (
            [
              "nom",
              "structureTypeLabel",
              "regionLabel",
              "departementLabel",
            ].includes(sortAttribute.name)
          ) {
            sortKey = dataCompare.cleanString(ts[sortAttribute.name]);
          } else if (sortAttribute.name === "domicilies") {
            sortKey = ts.stats.VALIDE;
          } else {
            sortKey = ts[sortAttribute.name];
          }

          return {
            ...ts,
            sortKey,
          };
        });
        tableStructuresWithSortKey.sort((a, b) => {
          return dataCompare.compareAttributes(a.sortKey, b.sortKey, {
            asc: sortAttribute.asc,
            nullFirst: false,
          });
        });
        return tableStructuresWithSortKey;
      })
    );
    return sortedTableStructures$;
  }

  private getRegionLabel(structure: Structure): string {
    const regionLabel = this.regions[structure.region];
    if (!regionLabel && structure.region) {
      // tslint:disable-next-line: no-console
      console.warn(
        `[DashboardTableStructure] region ${structure.region} not found.`
      );
    }
    return regionLabel;
  }

  private getDepartementLabel(structure: Structure): string {
    const departementLabel = this.departements[structure.departement];
    if (!departementLabel && structure.departement) {
      // tslint:disable-next-line: no-console
      console.warn(
        `[DashboardTableStructure] departement ${structure.departement} not found.`
      );
    }
    return departementLabel;
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public sortDashboard(
    name: DashboardTableSortAttribute,
    defaultSort: "asc" | "desc" = "asc"
  ) {
    if (name !== this.sortAttribute$.value.name) {
      this.sortAttribute$.next({
        name,
        asc: defaultSort === "asc",
      });
    } else {
      this.sortAttribute$.next({
        name,
        asc: !this.sortAttribute$.value.asc,
      });
    }
  }

  public deleteStructure(id: string) {
    this.statsService.deleteStructure(id).subscribe(
      () => {
        this.notifService.success(
          "Vous venez de recevoir un email vous permettant de supprimer la structure"
        );
      },
      () => {
        this.notifService.error(
          "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
      }
    );
  }
}
