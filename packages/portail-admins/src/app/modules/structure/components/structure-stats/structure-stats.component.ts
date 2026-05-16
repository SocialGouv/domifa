import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  SafeResourceUrl,
  DomSanitizer,
  Title,
} from "@angular/platform-browser";
import { MetabaseParams, StructureCommon } from "@domifa/common";
import { Subscription } from "rxjs";
import { StatsService } from "../../../stats/services/stats.service";
import { CustomToastService } from "../../../shared/services";
import saveAs from "file-saver";
import { ButtonComponent } from "../../../shared/components/button/button.component";

@Component({
  selector: "app-structure-stats",
  templateUrl: "./structure-stats.component.html",
  styleUrl: "./structure-stats.component.css",
  imports: [CommonModule, FormsModule, ButtonComponent],
})
export class StructureStatsComponent implements OnInit {
  public structure: StructureCommon;
  public metabaseParams = new MetabaseParams();
  public iframeUrl: SafeResourceUrl | null = null;
  public loading = false;
  private readonly subscription = new Subscription();
  public years: number[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private readonly statsService: StatsService,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.structure = data.structure;
        this.titleService.setTitle("Stats de " + this.structure.nom);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.metabaseParams.structureId = this.structure.id.toString() as any;
        for (let year = 2021; year <= new Date().getFullYear(); year++) {
          this.years.push(year);
        }
      })
    );
  }

  public getMetabaseUrl() {
    this.loading = true;
    this.iframeUrl = null;
    this.subscription.add(
      this.statsService.getMetabaseUrl(this.metabaseParams).subscribe({
        next: (response: { url: string }) => {
          this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            response.url
          );
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Le chargement des statistiques a échoué");
        },
      })
    );
  }

  public onIframeLoad(): void {
    if (!this.loading) {
      return;
    }
    this.loading = false;
    this.toastService.success("Chargement des statistiques terminé");
  }

  public export(): void {
    this.loading = true;

    if (!this.metabaseParams.structureId) {
      this.toastService.error("Veuillez choisir une structure dans la liste");
      return;
    }
    const startDate = new Date(this.metabaseParams.year.toString() + "-01-01");
    const endDate = new Date(this.metabaseParams.year.toString() + "-12-31");

    this.subscription.add(
      this.statsService
        .exportStatsForStructure(
          this.metabaseParams.structureId,
          startDate,
          endDate
        )
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
