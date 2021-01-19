import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDatepickerI18n,
} from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import { Structure } from "src/app/modules/structures/structure.interface";
import { interactionsLabels } from "src/app/modules/usagers/interactions.labels";
import * as labels from "src/app/modules/usagers/usagers.labels";
import { StructureStats } from "../../../../../_common/model";
import { StatsService } from "../../stats.service";
@Component({
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-stats",
  styleUrls: ["./stats.component.css"],
  templateUrl: "./stats.component.html",
})
export class StatsComponent implements OnInit, AfterViewInit {
  public stats: StructureStats;
  public statsDisplayDates: {
    start: Date;
    end: Date;
  };

  public structure: Structure;

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
  private defaultStartDate: Date;
  private defaultEndDate: Date;

  constructor(
    public calendar: NgbCalendar,
    public formatter: NgbDateCustomParserFormatter,
    private statsService: StatsService,
    private titleService: Title,
    private notifService: ToastrService,
    private cdRef: ChangeDetectorRef,
    private matomo: MatomoTracker
  ) {
    this.labels = labels;
    this.interactionsLabels = interactionsLabels;
  }

  public ngOnInit() {
    this.titleService.setTitle("Rapport d'activité de votre structure");

    const date = new Date("2020-01-01");
    this.defaultStartDate = date;
    this.minDate = new NgbDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    this.minDateFin = new NgbDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    this.fromDate = new NgbDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
  }

  public ngAfterViewInit() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    this.start = null;
    this.end = null;

    this.showCalendar = false;
    this.exportLoading = false;

    // Dates du calendrier
    this.defaultEndDate = yesterday;
    this.maxDate = new NgbDate(
      yesterday.getFullYear(),
      yesterday.getMonth() + 1,
      yesterday.getDate()
    );

    this.maxDateFin = new NgbDate(
      yesterday.getFullYear(),
      yesterday.getMonth() + 1,
      yesterday.getDate()
    );

    this.toDate = null;
    this.toDate = this.maxDate;

    this.cdRef.detectChanges();
  }

  public changeStart(newDate: NgbDate) {
    this.minDateFin = newDate;
  }

  private isSameDateIgnoreTime(d1: Date, d2: Date) {
    return (
      Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getDate()) ===
      Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getDate())
    );
  }

  public export(year?: number): void {
    this.exportLoading = true;

    if (year) {
      this.start = new Date(year.toString() + "-01-01");
      this.end = new Date(year.toString() + "-12-31");
    } else if (
      this.isSameDateIgnoreTime(this.start, this.defaultStartDate) &&
      this.isSameDateIgnoreTime(this.end, this.defaultEndDate)
    ) {
      this.matomo.trackEvent(
        "structure-stats",
        "telechargement_stats_structure_defaut",
        "null",
        1
      );
    } else {
      this.matomo.trackEvent(
        "structure-stats",
        "telechargement_stats_structure_personnalise",
        "null",
        1
      );
    }

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
    if (
      this.isSameDateIgnoreTime(this.start, this.defaultStartDate) &&
      this.isSameDateIgnoreTime(this.end, this.defaultEndDate)
    ) {
      this.matomo.trackEvent(
        "structure-stats",
        "show_stats_structure_defaut",
        "null",
        1
      );
    } else {
      this.matomo.trackEvent(
        "structure-stats",
        "show_stats_structure_personnalise",
        "null",
        1
      );
    }
    this.statsService
      .getStats(this.start, this.end)
      .subscribe((statsResult) => {
        this.statsDisplayDates = {
          start: new Date(statsResult.startDate),
          end: new Date(statsResult.endDate),
        };
        this.stats = statsResult.stats;
      });
  }
}
