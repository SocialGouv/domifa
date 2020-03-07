import { Component, OnInit } from "@angular/core";
import { statsLabels } from "src/app/modules/stats/stats.labels";
import * as labels from "src/app/modules/usagers/usagers.labels";
import { StatsService } from "../../stats.service";

@Component({
  selector: "app-rapport",
  styleUrls: ["./rapport.component.css"],
  templateUrl: "./rapport.component.html"
})
export class RapportComponent implements OnInit {
  public title: string;
  public stats: any;
  public statistiques: any;
  public labels: any;
  public statsLabels: any;

  constructor(public statsService: StatsService) {
    this.title = "Rapport Annuel";
    this.stats = {};
    this.labels = labels;
    this.statsLabels = statsLabels;
  }

  public ngOnInit() {
    /* this.statsService.getToday().subscribe((response: any) => {
      this.stats = response;
    });*/
    this.statsService.findAll().subscribe((response: any) => {
      this.statistiques = response;
    });
  }
}
