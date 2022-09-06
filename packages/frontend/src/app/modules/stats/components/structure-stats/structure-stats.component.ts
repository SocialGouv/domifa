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

import fileSaver from "file-saver";
import { MatomoTracker } from "ngx-matomo";
import { Subscription } from "rxjs";
import {
  StructureStatsFull,
  UserStructure,
} from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter";
import { CustomDatepickerI18n } from "../../../shared/services/date-french";
import { StatsService } from "../../services/stats.service";
import { buildExportStructureStatsFileName } from "./services";

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
  public stats!: StructureStatsFull;

  public loading: boolean;

  public start: Date;
  public end: Date | null;

  public hoveredDate: NgbDate | null = null;

  public minDateDebut: NgbDate;
  public minDateFin: NgbDate;
  public maxDateDebut: NgbDate;
  public maxDateFin: NgbDate;

  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;

  private defaultStartDate: Date;
  private defaultEndDate: Date;

  private me!: UserStructure;

  private subscriptions = new Subscription();

  constructor(
    public calendar: NgbCalendar,
    public formatter: NgbDateCustomParserFormatter,
    private readonly statsService: StatsService,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly matomo: MatomoTracker,
    private readonly authService: AuthService
  ) {
    this.loading = false;
    const date = new Date("2020-01-01");
    this.defaultStartDate = date;
    this.defaultEndDate = new Date();
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
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

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

    this.start = new Date();
    this.end = null;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Rapport d'activité de votre structure");

    this.subscriptions.add(
      this.authService.currentUserSubject.subscribe((user: UserStructure) => {
        this.me = user;
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  public changeStart(newDate: NgbDate): void {
    this.minDateFin = newDate;
  }

  private isSameDateIgnoreTime(d1: Date, d2: Date) {
    return (
      Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getDate()) ===
      Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getDate())
    );
  }

  public export(year?: number): void {
    this.loading = true;

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
    this.statsService.export(structureId, period.start, period.end).subscribe({
      next: (x: Blob) => {
        const newBlob = new Blob([x], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        fileSaver.saveAs(
          newBlob,
          buildExportStructureStatsFileName({
            startDateUTC: period.start,
            endDateUTC: period.end,
            structureId,
          })
        );

        this.loading = false;
      },
      error: () => {
        this.toastService.error(
          "Une erreur inattendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
        this.loading = false;
      },
    });
  }

  public compare(): void {
    this.loading = true;
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
    this.statsService.getStats(this.start, this.end).subscribe({
      next: (statsResult: StructureStatsFull) => {
        this.stats = statsResult;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.error(
          "Une erreur inattendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
      },
    });
  }
}
