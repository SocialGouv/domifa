import { Subject, Subscription, takeUntil } from "rxjs";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import {
  NgbDate,
  NgbDateParserFormatter,
  NgbDatepickerI18n,
} from "@ng-bootstrap/ng-bootstrap";

import { saveAs } from "file-saver";
import { buildExportStructureStatsFileName } from "../../services";
import {
  NgbDateCustomParserFormatter,
  CustomDatepickerI18n,
  CustomToastService,
  AuthService,
} from "../../../shared/services";
import {
  ENTRETIEN_RESIDENCE,
  ENTRETIEN_SITUATION_PRO,
  StructureStatsFull,
  ENTRETIEN_CAUSE_INSTABILITE,
  UserStructure,
  StructureStatsReportingQuestions,
} from "@domifa/common";
import { formatDateToNgb } from "../../../../shared";
import { StructureStatsService } from "../../services/structure-stats.service";
import { MatomoTracker } from "ngx-matomo-client";
import { format, startOfMonth, startOfYear, subYears } from "date-fns";

@Component({
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-structure-stats",
  styleUrls: ["./structure-stats.component.scss"],
  templateUrl: "./structure-stats.component.html",
})
export class StuctureStatsComponent implements AfterViewInit, OnDestroy {
  public stats: StructureStatsFull | null = null;

  public loading: boolean = false;

  public start: Date = new Date();
  public end: Date | null = null;

  public hoveredDate: NgbDate | null = null;

  public minStartDate: NgbDate;
  public minEndDate: NgbDate;
  public maxStartDate: NgbDate;
  public maxEndDate: NgbDate;

  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;
  public me!: UserStructure | null;

  private readonly subscription = new Subscription();
  public readonly ENTRETIEN_SITUATION_PRO = ENTRETIEN_SITUATION_PRO;

  public years: number[] = [];
  public currentYear = new Date().getFullYear();
  public selectedYear = new Date().getFullYear() - 1;
  public firstReportsYear = new Date().getFullYear() - 4; // only last 4 years

  public readonly ENTRETIEN_CAUSE_INSTABILITE = ENTRETIEN_CAUSE_INSTABILITE;
  public readonly ENTRETIEN_RESIDENCE = ENTRETIEN_RESIDENCE;

  public reports: StructureStatsReportingQuestions[] = [];
  public currentReport: StructureStatsReportingQuestions | null = null;
  public isCustomDates = false;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private readonly formatter: NgbDateCustomParserFormatter,
    private readonly structureStatsService: StructureStatsService,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly authService: AuthService,
    private readonly matomo: MatomoTracker,
    private cd: ChangeDetectorRef
  ) {
    for (let year = this.firstReportsYear; year < this.currentYear; year++) {
      this.years.push(year);
    }

    const refDate = startOfYear(subYears(new Date(), 4));

    this.minStartDate = new NgbDate(
      refDate.getFullYear(),
      refDate.getMonth() + 1,
      refDate.getDate()
    );
    this.minEndDate = new NgbDate(
      refDate.getFullYear(),
      refDate.getMonth() + 1,
      refDate.getDate()
    );
    this.fromDate = new NgbDate(
      refDate.getFullYear(),
      refDate.getMonth() + 1,
      refDate.getDate()
    );
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Dates du calendrier
    this.maxStartDate = new NgbDate(
      yesterday.getFullYear(),
      yesterday.getMonth() + 1,
      yesterday.getDate() + 1
    );

    this.maxEndDate = new NgbDate(yesterday.getFullYear() + 1, 1, 1);

    this.titleService.setTitle("Rapport d'activité - DomiFa");
    this.me = this.authService.currentUserValue;
    this.setCustomDates();
  }

  public ngAfterViewInit(): void {
    this.getReportings();
    this.cd.detectChanges();
  }

  public changeStart(newDate: NgbDate): void {
    this.minEndDate = newDate;
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
    } else {
      this.end =
        this.toDate !== null
          ? new Date(this.formatter.formatEn(this.toDate))
          : null;
    }

    const structureId = this.me?.structureId as number;

    this.subscription.add(
      this.structureStatsService
        .export(structureId, period.start, period.end)
        .subscribe({
          next: (x: Blob) => {
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

            this.loading = false;
          },
          error: () => {
            this.toastService.error(
              "Une erreur inattendue a eu lieu. Veuillez rééssayer dans quelques minutes"
            );
            this.loading = false;
          },
        })
    );
  }

  public getReportings(): void {
    this.reports = [];
    this.subscription.add(
      this.structureStatsService.getReportingQuestions().subscribe({
        next: (stats: StructureStatsReportingQuestions[]) => {
          for (
            let year = this.firstReportsYear;
            year <= this.currentYear;
            year++
          ) {
            const report =
              stats.find((r) => r.year === year) ||
              new StructureStatsReportingQuestions({
                year,
              } as StructureStatsReportingQuestions);
            this.reports.push(report);
          }

          this.currentReport = stats.find((r) => r.year === this.selectedYear);
        },
        error: () =>
          this.toastService.error(
            "La récupération des rapports d'activité a échoué"
          ),
      })
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onYearChange(year: any): void {
    if (year === this.selectedYear && this.stats) {
      return;
    }
    this.start = new Date(year as number, 0, 1);
    this.end = new Date(year as number, 11, 31);
    this.fromDate = formatDateToNgb(this.start);
    this.toDate = formatDateToNgb(this.end);
    this.isCustomDates = false;
    this.selectedYear = year;
    this.currentReport = this.reports.find((report) => report.year === year);

    this.compare();
  }

  public setCustomDates() {
    this.start = startOfMonth(new Date());
    this.end = new Date();
    this.fromDate = formatDateToNgb(this.start);
    this.toDate = formatDateToNgb(this.end);

    this.currentReport = null;
    this.isCustomDates = true;
    this.stats = null;
  }

  public compare(): void {
    this.loading = true;
    this.stats = null;
    this.start = new Date(this.formatter.formatEn(this.fromDate));
    this.end =
      this.toDate !== null
        ? new Date(this.formatter.formatEn(this.toDate))
        : null;

    const startFormatted = format(this.start, "dd/MM/yyyy");
    const endFormatted = format(this.start, "dd/MM/yyyy");
    const requestedInterval = `${startFormatted}${
      this.end ? endFormatted : ""
    }`;

    this.matomo.trackEvent(
      "STATS",
      this.isCustomDates ? "CUSTOM_DATES" : "ANNUAL_REPORT",
      requestedInterval,
      1
    );

    this.unsubscribe$.next();

    this.subscription.add(
      this.structureStatsService
        .getStats(this.me?.structureId as number, this.start, this.end)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
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
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
