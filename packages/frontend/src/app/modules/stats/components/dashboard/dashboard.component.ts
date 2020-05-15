import { Component, OnInit } from "@angular/core";
import { StructureService } from "src/app/modules/structures/services/structure.service";
import { Structure } from "src/app/modules/structures/structure.interface";
import { interactionsLabelsPluriel } from "src/app/modules/usagers/interactions.labels";
import * as labels from "src/app/modules/usagers/usagers.labels";
import { StatsService } from "../../stats.service";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-dashboard",
  styleUrls: ["./dashboard.component.css"],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  public interactionsLabels: any;
  public structures: Structure[];

  public usagers: any;
  public usagersValide: any;

  public interactions: any;
  public allInteractions: any;

  public users: number;
  public usersByStructure: any;

  public nbStructures: number;
  public structuresType: any;

  public labels: any;
  public todayStats: any;

  public statutClass = {
    ATTENTE_DECISION: "text-warning",
    INSTRUCTION: "text-primary",
    RADIE: "text-danger",
    REFUS: "text-danger",
    VALIDE: "text-secondary",
  };

  constructor(
    public statsService: StatsService,
    private structureService: StructureService,
    private titleService: Title
  ) {
    this.interactionsLabels = interactionsLabelsPluriel;
    this.labels = labels;

    this.users = 0;
    this.nbStructures = 0;

    this.structures = [];

    this.usagers = [];
    this.usagersValide = [];

    this.interactions = [];
    this.allInteractions = [];
    this.structuresType = [];
  }

  public ngOnInit() {
    this.titleService.setTitle("Dashboard de suivi");

    // Liste des structures
    this.statsService.getStructures().subscribe((structures: Structure[]) => {
      this.structures = structures;
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

    this.statsService.getUsagers().subscribe((retour: any[]) => {
      this.usagers = retour;
    });

    this.statsService.getUsagersValide().subscribe((usagersValide: any[]) => {
      this.usagersValide = usagersValide;
    });

    this.statsService.getInteractions().subscribe((stats: any[]) => {
      stats.forEach((stat) => {
        this.allInteractions[stat._id.statut] = stat.sum[0];
      });
    });
  }
}
