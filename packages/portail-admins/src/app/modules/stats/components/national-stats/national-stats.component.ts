import { Component, OnInit } from "@angular/core";
import {
  DomSanitizer,
  SafeResourceUrl,
  Title,
} from "@angular/platform-browser";
import {
  DEPARTEMENTS_LISTE,
  MetabaseParams,
  PortailAdminUser,
  REGIONS_DEF,
  REGIONS_LISTE,
  RegionsLabels,
  STRUCTURE_TYPE_LABELS,
  STRUCTURE_TYPE_MAP,
} from "@domifa/common";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { saveAs } from "file-saver";
import { Subscription, take, tap } from "rxjs";
import { StatsService } from "../../services/stats.service";
import { StructureListForStats } from "../../types/StructureListForStats.type";
import { MatomoTracker } from "ngx-matomo-client";
import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";

@Component({
  selector: "app-national-stats",
  templateUrl: "./national-stats.component.html",
  styleUrls: ["./national-stats.component.css"],
})
export class NationalStatsComponent implements OnInit {
  public years: number[] = [];

  public regionTable: RegionsLabels = {};
  public departmentTable: RegionsLabels = {};

  public enableRegions = true;

  public readonly STRUCTURE_TYPE_LABELS = STRUCTURE_TYPE_LABELS;
  public readonly STRUCTURE_TYPE_MAP = STRUCTURE_TYPE_MAP;

  public structures: Array<StructureListForStats> = [];
  public metabaseParams = new MetabaseParams();
  public iframeUrl: SafeResourceUrl | null = null;
  public loading = false;
  public titleLabel = "";
  private readonly subscription = new Subscription();

  public currentStructure!: StructureListForStats | null;
  public lastUpdate: Date | null = null;
  public user: PortailAdminUser | null;

  constructor(
    private sanitizer: DomSanitizer,
    private readonly statsService: StatsService,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title,
    private readonly adminAuthService: AdminAuthService,
    private readonly matomo: MatomoTracker
  ) {
    this.titleService.setTitle(
      "Outil de pilotage de la domiciliation en France"
    );

    for (let year = 2021; year <= new Date().getFullYear(); year++) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    this.subscription.add(
      this.statsService
        .getLastUpdateOfStats()
        .pipe(
          take(1),
          tap((lastUpdate: Date) => {
            this.lastUpdate = lastUpdate;
          })
        )
        .subscribe()
    );

    this.user = this.adminAuthService.currentUserValue;

    this.generateTablesByRole();
    this.titleLabel = this.getTitleLabel(this.user);
  }

  public setCurrentStructure() {
    this.currentStructure =
      this.structures.find(
        (structure) =>
          structure.id ===
          parseInt(this.metabaseParams.structureId as unknown as string, 10)
      ) || null;
  }

  public getTitleLabel(user: PortailAdminUser): string {
    if (user.role === "national" || user.role === "super-admin-domifa") {
      return "En France";
    }
    const territory: string | null =
      user.territories?.length > 0 ? user.territories[0] : null;

    if (territory) {
      if (user.role === "department") {
        return `dans le département: ${DEPARTEMENTS_LISTE[territory]}`;
      } else if (user.role === "region") {
        return `dans la région ${REGIONS_LISTE[territory]}`;
      }
    }
    return "en France";
  }

  public getMetabaseUrl() {
    this.loading = true;
    this.subscription.add(
      this.statsService.getMetabaseUrl(this.metabaseParams).subscribe({
        next: (response: { url: string }) => {
          this.matomo.trackEvent(
            "stats",
            "view",
            JSON.stringify(this.metabaseParams),
            1
          );

          this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            response.url
          );
          setTimeout(() => {
            this.loading = false;
            this.toastService.success("Chargement des statistiques en cours");
          }, 2000);
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Le chargement des statistiques a échoué");
        },
      })
    );
  }

  public deleteFilter(key: keyof MetabaseParams) {
    delete this.metabaseParams[key];
    this.getStructures();
  }

  public getStructures() {
    this.iframeUrl = null;
    this.loading = true;

    if (
      this.metabaseParams?.structureType &&
      !STRUCTURE_TYPE_MAP.includes(this.metabaseParams?.structureType)
    ) {
      delete this.metabaseParams.structureType;
    }

    this.currentStructure = null;
    delete this.metabaseParams.structureId;

    this.subscription.add(
      this.statsService.getStructures(this.metabaseParams).subscribe({
        next: (response: Array<StructureListForStats>) => {
          this.structures = response;
          this.loading = false;

          this.toastService.success(
            "La liste des structures a été mise à jour"
          );
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Le chargement des structures a échoué");
        },
      })
    );
  }

  public export(): void {
    this.loading = true;

    if (!this.metabaseParams.structureId) {
      this.toastService.error("Veuillez choisir une structure dans la liste");
      return;
    }
    const start = new Date(this.metabaseParams.year.toString() + "-01-01");
    const end = new Date(this.metabaseParams.year.toString() + "-12-31");

    this.subscription.add(
      this.statsService
        .export(this.metabaseParams.structureId, start, end)
        .subscribe({
          next: (x: Blob) => {
            const newBlob = new Blob([x], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            saveAs(
              newBlob,
              `export-structure-${this.metabaseParams.year}-${this.metabaseParams.structureId}`
            );

            this.loading = false;
          },
          error: () => {
            this.toastService.error(
              "Une erreur inattendue a eu lieu. Veuillez rééssayer dans quelques minutes"
            );
            this.loading = false;
          },
        })
    );
  }

  public generateTablesByRole(): void {
    const regionTable: RegionsLabels = {};
    const departmentTable: RegionsLabels = {};
    this.enableRegions = true;

    if (
      this.user?.role === "national" ||
      this.user?.role === "super-admin-domifa"
    ) {
      this.regionTable = REGIONS_LISTE;
      this.departmentTable = DEPARTEMENTS_LISTE;

      if (this.metabaseParams?.region) {
        const filteredDepartments: RegionsLabels = {};
        const selectedRegion = REGIONS_DEF.find(
          (region) => region.regionCode === this.metabaseParams.region
        );

        if (selectedRegion) {
          selectedRegion.departements.forEach((dept) => {
            filteredDepartments[dept.departmentCode] = dept.departmentName;
          });
          this.departmentTable = filteredDepartments;
        }
      }

      this.getStructures();
      return;
    }

    if (!this.user?.territories[0].length) {
      throw new Error("No territories");
    }

    const territory = this.user?.territories[0];

    if (this.user?.role === "region") {
      const targetRegion = REGIONS_DEF.find(
        (region) => region.regionCode === territory
      );

      if (targetRegion) {
        regionTable[targetRegion.regionCode] = targetRegion.regionName;

        targetRegion.departements.forEach((dept) => {
          departmentTable[dept.departmentCode] = dept.departmentName;
        });

        this.metabaseParams.region = territory;
      }
    } else if (this.user?.role === "department") {
      this.enableRegions = false;
      this.metabaseParams.department = territory;
      this.regionTable = {};
      for (const region of REGIONS_DEF) {
        const targetDept = region.departements.find(
          (dept) => dept.departmentCode === territory
        );

        if (targetDept) {
          departmentTable[targetDept.departmentCode] =
            targetDept.departmentName;

          break;
        }
      }
    }

    this.regionTable = regionTable;
    this.departmentTable = departmentTable;
    this.getStructures();
  }
}
