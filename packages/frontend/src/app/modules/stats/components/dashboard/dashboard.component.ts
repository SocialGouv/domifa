import { Component, OnInit } from "@angular/core";
import { StructureService } from "src/app/modules/structures/services/structure.service";
import { Structure } from "src/app/modules/structures/structure.interface";
import { StatsService } from "../../stats.service";

@Component({
  selector: "app-dashboard",
  styleUrls: ["./dashboard.component.css"],
  templateUrl: "./dashboard.component.html"
})
export class DashboardComponent implements OnInit {
  public title: string;
  public stats: any;
  public structures: Structure[];

  public statutClass = {
    ATTENTE_DECISION: "btn-warning",
    INSTRUCTION: "btn-primary",
    RADIE: "btn-danger",
    REFUS: "btn-danger",
    VALIDE: "btn-secondary"
  };
  public decisionLabels = {
    ATTENTE_DECISION: "Demande de domiciliation déposée",
    IMPORT: "Dossier importé",
    INSTRUCTION: "Instruction du dossier",
    RADIE: "Radiation",
    REFUS: "Demande refusée",
    VALIDE: "Domiciliation acceptée"
  };

  constructor(
    public statsService: StatsService,
    private structureService: StructureService
  ) {}

  public ngOnInit() {
    this.title = "Statistiques";
    this.stats = [];
    this.structureService.findAll().subscribe((structures: Structure[]) => {
      this.structures = structures;
    });

    this.statsService.getStatuts().subscribe((stats: any[]) => {
      stats.forEach(stat => {
        this.stats[stat._id.structureId] = stat.statut;
      });
    });
  }
}
