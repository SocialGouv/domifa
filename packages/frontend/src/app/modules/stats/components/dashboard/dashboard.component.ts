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
  public structures: Structure[];
  constructor(
    public statsService: StatsService,
    private structureService: StructureService
  ) {}

  public ngOnInit() {
    this.title = "Statistiques";
    this.structureService.findAll().subscribe((structures: Structure[]) => {
      this.structures = structures;
    });
  }
}
