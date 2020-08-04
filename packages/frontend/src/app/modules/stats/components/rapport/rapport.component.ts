import { Component, OnInit } from "@angular/core";

import * as labels from "src/app/modules/usagers/usagers.labels";
import { interactionsLabels } from "src/app/modules/usagers/interactions.labels";

import { Stats } from "../../stats.interface";
import { StatsService } from "../../stats.service";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-rapport",
  styleUrls: ["./rapport.component.css"],
  templateUrl: "./rapport.component.html",
})
export class RapportComponent implements OnInit {
  public stats: Stats;
  public labels: any;
  public interactionsLabels: any;

  constructor(public statsService: StatsService, private titleService: Title) {
    this.stats = new Stats();
    this.labels = labels;
    this.interactionsLabels = interactionsLabels;
  }

  public ngOnInit() {
    this.titleService.setTitle("Rapport d'activité annuel");
    this.statsService.getToday().subscribe((response: Stats) => {
      this.stats = response;
    });
  }
}
