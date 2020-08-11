import { Component, OnInit } from "@angular/core";

import * as labels from "src/app/modules/usagers/usagers.labels";
import { interactionsLabels } from "src/app/modules/usagers/interactions.labels";

import { Stats } from "../../stats.interface";
import { StatsService } from "../../stats.service";
import { Title } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-rapport",
  styleUrls: ["./rapport.component.css"],
  templateUrl: "./rapport.component.html",
})
export class RapportComponent implements OnInit {
  public stats: Stats;
  public statsList: any[];

  public labels: any;
  public interactionsLabels: any;
  public exportLoading: boolean;

  public start: Date;
  public end: Date;

  constructor(
    public statsService: StatsService,
    private titleService: Title,
    private notifService: ToastrService
  ) {
    this.stats = new Stats();
    this.labels = labels;
    this.interactionsLabels = interactionsLabels;
    this.start = new Date();
    this.end = new Date();
    this.exportLoading = false;
    this.statsList = [];
  }

  public ngOnInit() {
    this.titleService.setTitle("Rapport d'activité annuel");
    this.statsService.getToday().subscribe((response: Stats) => {
      this.stats = response;
    });
    this.statsService.getAvailabelStats().subscribe((response: any) => {
      this.statsList = response;
    });
  }

  public getStatById(newValue: string) {
    this.statsService.getStatById(newValue).subscribe((response: Stats) => {
      this.stats = response;
    });
  }

  public export() {
    this.exportLoading = true;
    this.statsService.export(this.stats._id).subscribe(
      (x: any) => {
        const newBlob = new Blob([x], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(newBlob, "export_stats_domifa" + ".xlsx");
        setTimeout(() => {
          this.exportLoading = false;
        }, 500);
      },
      (error: any) => {
        this.notifService.error(
          "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
        this.exportLoading = false;
      }
    );
  }

  public statDate(date: Date) {
    const ret = new Date(date).getDate() - 1;
    return new Date(date).setDate(ret);
  }
}
