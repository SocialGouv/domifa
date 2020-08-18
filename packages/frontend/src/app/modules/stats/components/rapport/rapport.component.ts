import { Component, OnInit } from "@angular/core";

import * as labels from "src/app/modules/usagers/usagers.labels";
import { interactionsLabels } from "src/app/modules/usagers/interactions.labels";

import { Stats } from "../../stats.interface";
import { StatsService } from "../../stats.service";
import { Title } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import {
  NgbDate,
  NgbCalendar,
  NgbDatepickerI18n,
  NgbDateParserFormatter,
} from "@ng-bootstrap/ng-bootstrap";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";

@Component({
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
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

  public hoveredDate: NgbDate | null = null;

  public minDate: NgbDate;
  public maxDate: NgbDate;

  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;

  constructor(
    public statsService: StatsService,
    private titleService: Title,
    private notifService: ToastrService,
    public calendar: NgbCalendar,
    public formatter: NgbDateCustomParserFormatter
  ) {
    this.stats = new Stats();
    this.labels = labels;
    this.interactionsLabels = interactionsLabels;

    this.start = new Date();
    this.start.setDate(this.start.getDate() - 2);

    this.end = null;

    this.exportLoading = false;
    this.statsList = [];

    // Dates du calendrier
    this.maxDate = new NgbDate(
      this.start.getFullYear(),
      this.start.getMonth() + 1,
      this.start.getDate()
    );

    this.minDate = new NgbDate(2020, 6, 1);

    this.toDate = this.maxDate;
    this.fromDate = this.maxDate;
  }

  public ngOnInit() {
    this.titleService.setTitle("Rapport d'activité annuel");

    this.compare();

    this.statsService.getAvailabelStats().subscribe((response: any) => {
      this.statsList = response;
    });
  }

  public getStatById(newValue: string) {
    this.statsService.getStatById(newValue).subscribe((response: Stats) => {
      this.stats = response;
    });
  }

  public exportId() {
    this.exportLoading = true;
    this.statsService.exportId(this.stats._id).subscribe(
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

  public export() {
    this.exportLoading = true;

    console.log(this.start);
    this.statsService.export(this.start, this.end).subscribe(
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

  public compare() {
    this.statsService
      .getStats(this.start, this.end)
      .subscribe((response: Stats) => {
        this.stats = response;
      });
  }

  public onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
      this.start = new Date(this.formatter.formatEn(date));
    } else if (
      this.fromDate &&
      !this.toDate &&
      date &&
      date.after(this.fromDate)
    ) {
      this.toDate = date;
      this.end = new Date(this.formatter.formatEn(date));
    } else {
      this.toDate = null;
      this.end = null;
      this.fromDate = date;
      this.start = new Date(this.formatter.formatEn(date));
    }
  }

  public isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  public isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  public isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  public validateInput(
    currentValue: NgbDate | null,
    input: string
  ): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed))
      ? NgbDate.from(parsed)
      : currentValue;
  }
}
