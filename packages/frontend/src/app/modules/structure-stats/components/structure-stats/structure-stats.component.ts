import { Subscription } from "rxjs";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
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
import { startOfMonth } from "date-fns";

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
export class StuctureStatsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  public stats!: StructureStatsFull;

  public loading: boolean;

  public start: Date = new Date();
  public end: Date | null = null;

  public hoveredDate: NgbDate | null = null;

  public minDateDebut: NgbDate;
  public minDateFin: NgbDate;
  public maxDateDebut: NgbDate;
  public maxDateFin: NgbDate;

  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;
  private me!: UserStructure | null;

  private readonly subscription = new Subscription();
  public readonly ENTRETIEN_SITUATION_PRO = ENTRETIEN_SITUATION_PRO;

  public years: number[] = [];
  public currentYear = new Date().getFullYear();
  public selectedYear = new Date().getFullYear() - 1;
  public lastYear = new Date().getFullYear() - 1;

  public readonly ENTRETIEN_CAUSE_INSTABILITE = ENTRETIEN_CAUSE_INSTABILITE;
  public readonly ENTRETIEN_RESIDENCE = ENTRETIEN_RESIDENCE;

  public reports: StructureStatsReportingQuestions[] = [];
  public currentReport: StructureStatsReportingQuestions | null = null;
  public isCustomDates = false;

  constructor(
    private readonly formatter: NgbDateCustomParserFormatter,
    private readonly structureStatsService: StructureStatsService,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly matomo: MatomoTracker
  ) {
    for (let year = 2021; year <= this.currentYear; year++) {
      this.years.push(year);
    }

    this.loading = false;
    const date = new Date("2020-01-01");

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
    this.maxDateDebut = new NgbDate(
      yesterday.getFullYear(),
      yesterday.getMonth() + 1,
      yesterday.getDate() + 1
    );

    this.maxDateFin = new NgbDate(yesterday.getFullYear() + 1, 1, 1);

    this.onYearChange(this.selectedYear);
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Rapport d'activité - DomiFa");
    this.me = this.authService.currentUserValue;
    this.getReportings();
  }

  public ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  public changeStart(newDate: NgbDate): void {
    this.minDateFin = newDate;
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

  public getReportings() {
    this.subscription.add(
      this.structureStatsService.getReportingQuestions().subscribe({
        next: (stats: StructureStatsReportingQuestions[]) => {
          this.reports = stats;
          this.currentReport = this.reports.find(
            (report) => report.year === this.selectedYear
          );
        },
        error: () => {
          this.toastService.error(
            "La récupération des rapports d'activité à échoué"
          );
        },
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

    this.matomo.trackEvent(
      "getStats",
      this.isCustomDates ? "customDates" : "annualReport",
      this.start.toString(),
      1
    );

    this.subscription.add(
      this.structureStatsService
        .getStats(this.me?.structureId as number, this.start, this.end)
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
  }
}
