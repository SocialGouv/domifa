import { Component, OnInit } from "@angular/core";
import { StructureService } from "src/app/modules/structures/services/structure.service";
import { Structure } from "src/app/modules/structures/structure.interface";
import { interactionsLabels } from "src/app/modules/usagers/interactions.labels";
import * as labels from "src/app/modules/usagers/usagers.labels";
import { StatsService } from "../../stats.service";

@Component({
  selector: "app-dashboard",
  styleUrls: ["./dashboard.component.css"],
  templateUrl: "./dashboard.component.html"
})
export class DashboardComponent implements OnInit {
  public title: string;

  public interactionsLabels: any;
  public structures: Structure[];

  public stats: any;
  public interactions: any;
  public labels: any;

  public statutClass = {
    ATTENTE_DECISION: "text-warning",
    INSTRUCTION: "text-primary",
    RADIE: "text-danger",
    REFUS: "text-danger",
    VALIDE: "text-secondary"
  };

  constructor(
    public statsService: StatsService,
    private structureService: StructureService
  ) {
    this.interactionsLabels = interactionsLabels;
    this.labels = labels;
    this.title = "Statistiques";
    this.stats = [];
    this.interactions = [];
  }

  public ngOnInit() {
    this.structureService.findAll().subscribe((structures: Structure[]) => {
      this.structures = structures;
    });

    this.statsService.getStatuts().subscribe((stats: any[]) => {
      stats.forEach(stat => {
        this.stats[stat._id.structureId] = stat.statut;
      });
    });

    this.statsService.getInteractionsStats().subscribe((stats: any[]) => {
      stats.forEach(stat => {
        this.interactions[stat._id.structureId] = stat.type;
      });
    });
  }
}
