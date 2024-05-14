import { Component } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import {
  DEPARTEMENTS_MAP,
  MetabaseParams,
  REGIONS_LISTE,
  STRUCTURE_TYPE_LABELS,
  STRUCTURE_TYPE_MAP,
} from "@domifa/common";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { saveAs } from "file-saver";
import { Subscription } from "rxjs";
import { StatsService } from "../../services/stats.service";
import { StructureListForStats } from "./StructureListForStats.type";

@Component({
  selector: "app-national-stats",
  templateUrl: "./national-stats.component.html",
  styleUrls: ["./national-stats.component.css"],
})
export class NationalStatsComponent {
  public readonly REGIONS_LISTE = REGIONS_LISTE;
  public years: number[] = [];
  public departments: string[] = [];
  public regions: string[] = Object.keys(REGIONS_LISTE).sort((a, b) =>
    a.localeCompare(b)
  );
  public readonly DEPARTEMENTS_MAP = { ...DEPARTEMENTS_MAP };

  public readonly STRUCTURE_TYPE_LABELS = STRUCTURE_TYPE_LABELS;
  public readonly STRUCTURE_TYPE_MAP = STRUCTURE_TYPE_MAP;

  public structures: Array<StructureListForStats> = [];
  public metabaseParams = new MetabaseParams();
  public iframeUrl: SafeResourceUrl | null = null;
  public loading = false;
  private readonly subscription = new Subscription();

  constructor(
    private sanitizer: DomSanitizer,
    private readonly statsService: StatsService,
    private readonly toastService: CustomToastService
  ) {
    for (let year = 2021; year <= new Date().getFullYear(); year++) {
      this.years.push(year);
    }

    this.updateDepartments();
  }

  public updateDepartments() {
    if (this.metabaseParams.region) {
      this.departments = Object.values({ ...DEPARTEMENTS_MAP })
        .filter(
          (department) => department.regionCode === this.metabaseParams.region
        )
        .map((department) => department.departmentCode);
    } else {
      this.departments = Object.keys({ ...DEPARTEMENTS_MAP });
    }

    this.departments.sort((a, b) => a.localeCompare(b));
    this.metabaseParams.structureId = undefined;
  }

  public getMetabaseUrl() {
    this.statsService.getMetabaseUrl(this.metabaseParams).subscribe({
      next: (response: { url: string }) => {
        this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          response.url
        );

        this.toastService.success("Chargement des statistiques en cours");
      },
      error: () => {
        this.toastService.error("Le chargement des statistiques a échoué");
      },
    });
  }

  public getStructures() {
    this.statsService.getStructures(this.metabaseParams).subscribe({
      next: (response: Array<StructureListForStats>) => {
        this.structures = response;
        this.toastService.success("La liste des structures a été mise à jour");
      },
      error: () => {
        this.toastService.error("Le chargement des structures a échoué");
      },
    });
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
}
