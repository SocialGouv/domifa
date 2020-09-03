import {
  Component,
  OnInit,
  ChangeDetectorRef,
  AfterViewChecked,
  AfterViewInit,
} from "@angular/core";

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
  selector: "app-stats",
  styleUrls: ["../rapport/rapport.component.css", "./stats.component.css"],
  templateUrl: "./stats.component.html",
})
export class StatsComponent implements OnInit, AfterViewInit {
  public stats: Stats;
  public statsList: any[];

  public labels: any;
  public interactionsLabels: any;

  public exportLoading: boolean;
  public showCalendar: boolean;

  public start: Date;
  public end: Date;

  public hoveredDate: NgbDate | null = null;

  public minDate: NgbDate;
  public minDateFin: NgbDate;
  public maxDate: NgbDate;
  public maxDateFin: NgbDate;

  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;

  constructor(
    public statsService: StatsService,
    private titleService: Title,
    private notifService: ToastrService,
    public calendar: NgbCalendar,
    public formatter: NgbDateCustomParserFormatter,
    private cdRef: ChangeDetectorRef
  ) {
    this.stats = new Stats();
    this.labels = labels;
    this.interactionsLabels = interactionsLabels;
  }

  public ngOnInit() {
    this.titleService.setTitle("Rapport d'activité de votre structure");

    this.statsService.getAvailabelStats().subscribe((response: any) => {
      this.statsList = response;
    });
  }

  public ngAfterViewInit() {
    const dateStart = new Date();
    dateStart.setDate(dateStart.getDate() - 1);

    this.start = null;
    this.end = null;

    this.showCalendar = false;
    this.exportLoading = false;
    this.statsList = [];

    // Dates du calendrier
    this.maxDate = new NgbDate(
      dateStart.getFullYear(),
      dateStart.getMonth() + 1,
      dateStart.getDate()
    );
    this.minDate = new NgbDate(2020, 1, 1);

    this.maxDateFin = new NgbDate(
      dateStart.getFullYear(),
      dateStart.getMonth() + 1,
      dateStart.getDate()
    );
    this.minDateFin = new NgbDate(2020, 1, 2);

    this.toDate = null;
    this.fromDate = this.minDate;

    this.cdRef.detectChanges();
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

  public changeStart(newDate: NgbDate) {
    this.minDateFin = newDate;
    this.toDate = null;
    this.end = null;
  }

  public export() {
    this.exportLoading = true;
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
    this.start = new Date(this.formatter.formatEn(this.fromDate));
    this.end =
      this.toDate !== null
        ? new Date(this.formatter.formatEn(this.toDate))
        : null;

    this.statsService
      .getStats(this.start, this.end)
      .subscribe((response: Stats) => {
        this.stats = response;
      });
  }
}
