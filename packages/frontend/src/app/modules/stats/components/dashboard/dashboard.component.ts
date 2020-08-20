import { Component, OnInit } from "@angular/core";

import { Structure } from "src/app/modules/structures/structure.interface";
import { interactionsLabelsPluriel } from "src/app/modules/usagers/interactions.labels";
import * as labels from "src/app/modules/usagers/usagers.labels";
import { regions } from "../../regions.labels";
import { StatsService } from "../../stats.service";
import { Title } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";

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
  public structuresRegions: any;

  public labels: any;
  public todayStats: any;

  public regions: any;

  public sort: {
    type: string;
    value: string;
  };

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
    this.regions = regions;

    this.users = 0;
    this.nbStructures = 0;

    this.structures = [];

    this.usagers = [];
    this.usagersValide = [];

    this.interactions = [];
    this.allInteractions = [];
    this.structuresType = [];

    this.sort = {
      type: "ascending",
      value: "createdAt",
    };
  }

  public ngOnInit() {
    this.titleService.setTitle("Dashboard de suivi");

    // Liste des structures
    this.getStructures();

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

    this.statsService
      .getStructuresByRegion()
      .subscribe((structuresRegions: any) => {
        this.structuresRegions = structuresRegions;
      });

    this.statsService.getInteractions().subscribe((stats: any[]) => {
      stats.forEach((stat) => {
        this.allInteractions[stat._id.statut] = stat.sum[0];
      });
    });
  }

  public getStructures() {
    this.structures = [];
    this.statsService
      .getStructures(this.sort.value, this.sort.type)
      .subscribe((structures: Structure[]) => {
        this.structures = structures;
      });
  }

  public sortDashboard(value: string) {
    if (value !== this.sort.value) {
      this.sort.value = value;
      this.sort.type = "ascending";
    } else {
      this.sort.type =
        this.sort.type === "ascending" ? "descending" : "ascending";
    }
    this.getStructures();
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
