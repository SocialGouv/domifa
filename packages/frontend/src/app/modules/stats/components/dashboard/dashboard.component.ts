import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { saveAs } from "file-saver";
import { ToastrService } from "ngx-toastr";
import {
  BehaviorSubject,
  combineLatest,
  ReplaySubject,
  Subscription,
} from "rxjs";
import { map } from "rxjs/operators";
import { interactionsLabelsPluriel } from "src/app/modules/usagers/interactions.labels";
import * as labels from "src/app/modules/usagers/usagers.labels";
import {
  dataCompare,
  departements,
  DepartementsLabels,
  languagesAutocomplete,
  RegionsLabels,
  REGIONS_LABELS_MAP,
} from "src/app/shared";
import {
  DashboardStats,
  Structure,
  StructureAdmin,
} from "../../../../../_common/model";
import { StatsService } from "../services/stats.service";
import { buildExportStructureStatsFileName } from "../structure-stats/structure-stats.component";

export type DashboardTableStructure = StructureAdmin & {
  structureTypeLabel: string;
  regionLabel: string;
  departementLabel: string;
  usersCount?: number;
};

type DashboardTableSortAttribute =
  | "id"
  | "nom"
  | "structureTypeLabel"
  | "createdAt"
  | "import"
  | "importDate"
  | "usersCount"
  | "usagersAyantsDroitsCount"
  | "usagersAllCount"
  | "usagersValideCount"
  | "lastLogin"
  | "regionLabel"
  | "departementLabel";

@Component({
  selector: "app-dashboard",
  styleUrls: ["./dashboard.component.css"],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit, OnDestroy {
  public interactionsLabels: any;
  public stats$ = new ReplaySubject<DashboardStats>(1);
  public stats: DashboardStats;
  public sortAttribute$ = new BehaviorSubject<{
    name: DashboardTableSortAttribute;
    asc: boolean;
  }>({
    name: "nom",
    asc: false,
  });
  public sortedTableStructures: DashboardTableStructure[];

  public interactions: any;

  public usersByStructure: any;

  public nbStructures: number;

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

  public languagesAutocomplete = languagesAutocomplete;

  constructor(
    private statsService: StatsService,
    private titleService: Title,
    private notifService: ToastrService
  ) {
    this.interactionsLabels = interactionsLabelsPluriel;
    this.labels = labels;
    this.regions = REGIONS_LABELS_MAP;
    this.departements = departements;

    this.nbStructures = 0;

    this.sortedTableStructures = [];

    this.interactions = [];
  }

  public ngOnInit() {
    this.titleService.setTitle("Dashboard de suivi");

    // Liste des structures
    this.statsService
      .getStatsDomifaAdminDashboard()
      .subscribe((stats: DashboardStats) => {
        this.stats$.next(stats);
        this.stats = stats;
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
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

  public exportYearStats(structureId: number, year: number): void {
    this.exportLoading = true;

    const period = {
      start: new Date(year.toString() + "-01-01"),
      end: new Date(year.toString() + "-12-31"),
    };

    this.statsService.export(structureId, period.start, period.end).subscribe(
      (x: any) => {
        const newBlob = new Blob([x], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(
          newBlob,
          buildExportStructureStatsFileName({
            startDateUTC: period.start,
            endDateUTC: period.end,
            structureId,
          })
        );
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
    const tableStructures$ = this.stats$.pipe(
      map(({ structures }) =>
        structures.map(
          (
            structure: StructureAdmin & {
              usersCount?: number; // dashboard only
            }
          ) => {
            const tableStructure: DashboardTableStructure = {
              ...structure,
              structureTypeLabel: labels.structureType[structure.structureType],
              regionLabel: this.getRegionLabel(structure),
              departementLabel: this.getDepartementLabel(structure),
            };
            return tableStructure;
          }
        )
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
          } else if (sortAttribute.name === "usagersValideCount") {
            sortKey = this.stats.usagersValidCountByStructureMap[ts.id];
          } else if (sortAttribute.name === "usagersAllCount") {
            sortKey = this.stats.usagersAllCountByStructureMap[ts.id];
          } else if (sortAttribute.name === "usagersAyantsDroitsCount") {
            sortKey = this.stats.usagersAyantsDroitsCountByStructureMap[ts.id];
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

  private getRegionLabel(structure: Pick<Structure, "region">): string {
    const regionLabel = this.regions[structure.region];
    if (!regionLabel && structure.region) {
      // tslint:disable-next-line: no-console
      console.warn(
        `[DashboardTableStructure] region ${structure.region} not found.`
      );
    }
    return regionLabel;
  }

  private getDepartementLabel(
    structure: Pick<Structure, "departement">
  ): string {
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

  public deleteStructure(id: string): void {
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

  public enableSms(structure: Structure): void {
    this.statsService.enableSms(structure.id).subscribe(
      () => {
        structure.sms.enabledByDomifa = !structure.sms.enabledByDomifa;

        let message = structure.sms.enabledByDomifa
          ? "SMS activés"
          : "SMS désactivés";
        message = message + " pour la structure : " + structure.nom;
        this.notifService.success(message);
      },
      () => {
        this.notifService.error(
          "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
      }
    );
  }
}
