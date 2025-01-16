import { Component, Input, OnInit } from "@angular/core";
import {
  SafeResourceUrl,
  DomSanitizer,
  Title,
} from "@angular/platform-browser";
import { MetabaseParams, StructureCommon } from "@domifa/common";
import { Subscription } from "rxjs";
import { StatsService } from "../../../admin-structures/services/stats.service";
import { CustomToastService } from "../../../shared/services";
import saveAs from "file-saver";

@Component({
  selector: "app-structure-stats",
  templateUrl: "./structure-stats.component.html",
  styleUrl: "./structure-stats.component.css",
})
export class StructureStatsComponent implements OnInit {
  @Input({ required: true }) public structure: StructureCommon;
  public metabaseParams = new MetabaseParams();
  public iframeUrl: SafeResourceUrl | null = null;
  public loading = false;
  private readonly subscription = new Subscription();
  public years: number[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private readonly statsService: StatsService,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("Stats de " + this.structure.nom);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.metabaseParams.structureId = this.structure.id.toString() as any;
    this.getMetabaseUrl();

    for (let year = 2021; year <= new Date().getFullYear(); year++) {
      this.years.push(year);
    }
  }

  public getMetabaseUrl() {
    this.loading = true;
    this.subscription.add(
      this.statsService.getMetabaseUrl(this.metabaseParams).subscribe({
        next: (response: { url: string }) => {
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
