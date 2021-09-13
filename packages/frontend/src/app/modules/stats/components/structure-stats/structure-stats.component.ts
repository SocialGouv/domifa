import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDatepickerI18n,
} from "@ng-bootstrap/ng-bootstrap";
import { saveAs } from "file-saver";
import moment from "moment";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import {
  StructureStatsFull,
  UserStructure,
} from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { StatsService } from "../../services/stats.service";
@Component({
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-stats",
  styleUrls: ["./structure-stats.component.css"],
  templateUrl: "./structure-stats.component.html",
})
export class StatsComponent implements OnInit, AfterViewInit, OnDestroy {
  public stats: StructureStatsFull;

  public exportLoading: boolean;
  public showCalendar: boolean;

  public start: Date;
  public end: Date;

  public hoveredDate: NgbDate | null = null;

  public minDateDebut: NgbDate;
  public minDateFin: NgbDate;
  public maxDateDebut: NgbDate;
  public maxDateFin: NgbDate;

  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;

  private defaultStartDate: Date;
  private defaultEndDate: Date;

  private me: UserStructure;

  private subscriptions = new Subscription();

  constructor(
    public calendar: NgbCalendar,
    public formatter: NgbDateCustomParserFormatter,
    private statsService: StatsService,
    private titleService: Title,
    private notifService: ToastrService,
    private cdRef: ChangeDetectorRef,
    private matomo: MatomoTracker,
    private authService: AuthService
  ) {}

  public ngOnInit() {
    this.titleService.setTitle("Rapport d'activité de votre structure");

    const date = new Date("2020-01-01");
    this.defaultStartDate = date;
    this.minDateDebut = new NgbDate(
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
    this.subscriptions.add(
      this.authService.currentUserSubject.subscribe((user: UserStructure) => {
        this.me = user;
      })
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
    this.maxDateDebut = new NgbDate(
      yesterday.getFullYear(),
      yesterday.getMonth() + 1,
      yesterday.getDate() + 1
    );

    this.maxDateFin = new NgbDate(
      yesterday.getFullYear(),
      yesterday.getMonth() + 1,
      yesterday.getDate() + 1
    );

    this.toDate = null;
    this.toDate = new NgbDate(
      yesterday.getFullYear(),
      yesterday.getMonth() + 1,
      yesterday.getDate()
    );

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

    const period = {
      start: this.start,
      end: this.end,
    };
    if (year) {
      period.start = new Date(year.toString() + "-01-01");
      period.end = new Date(year.toString() + "-12-31");
    } else if (
      this.isSameDateIgnoreTime(period.start, this.defaultStartDate) &&
      this.isSameDateIgnoreTime(period.end, this.defaultEndDate)
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
    const structureId = this.me.structureId;
    this.statsService.export(structureId, period.start, period.end).subscribe(
      (x: any) => {
        const newBlob = new Blob([x], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(
          newBlob,
          buildExportStructureStatsFileName({
            startDateUTC: period.start,
            endDateUTC: period.end,
            structureId,
          })
        );
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
      .getStats(this.me.structureId, this.start, this.end)
      .subscribe((statsResult) => {
        this.stats = statsResult;
      });
  }
}

export function buildExportStructureStatsFileName({
  startDateUTC,
  endDateUTC,
  structureId,
}: {
  startDateUTC: Date;
  endDateUTC: Date;
  structureId: number;
}) {
  return `${moment(startDateUTC).format("yyyy-MM-DD")}_${moment(
    endDateUTC
  ).format("yyyy-MM-DD")}_export-structure-${structureId}-stats.xlsx`;
}
