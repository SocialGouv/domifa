import { Subject, Subscription, takeUntil } from "rxjs";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
} from "@angular/core";
import { Title } from "@angular/platform-browser";

import { saveAs } from "file-saver";
import { buildExportStructureStatsFileName } from "../../services";
import { CustomToastService, AuthService } from "../../../shared/services";
import {
  ENTRETIEN_RESIDENCE,
  ENTRETIEN_SITUATION_PRO,
  StructureStatsFull,
  ENTRETIEN_CAUSE_INSTABILITE,
  UserStructure,
  StructureStatsReportingQuestions,
} from "@domifa/common";
import {
  formatDateToFr,
  formatDateToIso,
  parseFrDate,
  toUtcNoon,
} from "../../../../shared";
import { StructureStatsService } from "../../services/structure-stats.service";
import { MatomoTracker } from "ngx-matomo-client";
import { format, startOfMonth, startOfYear, subYears } from "date-fns";

@Component({
  providers: [],
  selector: "app-structure-stats",
  styleUrls: ["./structure-stats.component.scss"],
  templateUrl: "./structure-stats.component.html",
  standalone: false,
})
export class StuctureStatsComponent implements AfterViewInit, OnDestroy {
  public stats: StructureStatsFull | null = null;

  public loading: boolean = false;

  public startDate: Date = new Date();
  public endDate: Date | null = null;

  public minStartDate: string;
  public minEndDate: string;
  public maxStartDate: string;
  public maxEndDate: string;

  public fromDate: string;
  public toDate: string | null = null;
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
  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private readonly structureStatsService: StructureStatsService,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly authService: AuthService,
    private readonly matomo: MatomoTracker,
    private readonly cd: ChangeDetectorRef
  ) {
    for (let year = this.firstReportsYear; year < this.currentYear; year++) {
      this.years.push(year);
    }

    const refDate = toUtcNoon(startOfYear(subYears(new Date(), 4)));

    this.minStartDate = formatDateToIso(refDate);
    this.minEndDate = formatDateToIso(refDate);
    this.fromDate = formatDateToFr(refDate);

    const today = toUtcNoon(new Date());
    this.maxStartDate = formatDateToIso(today);
    this.maxEndDate = `${today.getFullYear() + 1}-01-01`;

    this.titleService.setTitle("Rapport d'activité - DomiFa");
    this.me = this.authService.currentUserValue;
    this.setCustomDates();
  }

  public ngAfterViewInit(): void {
    this.getReportings();
    this.cd.detectChanges();
  }

  public changeStart(newDate: string): void {
    const parsed = parseFrDate(newDate);
    if (parsed) {
      this.minEndDate = formatDateToIso(parsed);
    }
  }

  public export(year?: number): void {
    this.loading = true;

    const period = {
      startDate: this.startDate,
      endDate: this.endDate,
    };

    if (year) {
      period.startDate = new Date(year.toString() + "-01-01");
      period.endDate = new Date(year.toString() + "-12-31");
    } else {
      this.endDate = this.toDate !== null ? parseFrDate(this.toDate) : null;
    }

    const structureId = this.me?.structureId as number;

    this.subscription.add(
      this.structureStatsService
        .export(structureId, period.startDate, period.endDate)
        .subscribe({
          next: (x: Blob) => {
            const newBlob = new Blob([x], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            saveAs(
              newBlob,
              buildExportStructureStatsFileName({
                startDateUTC: period.startDate,
                endDateUTC: period.endDate,
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
    this.startDate = toUtcNoon(new Date(year as number, 0, 1));
    this.endDate = toUtcNoon(new Date(year as number, 11, 31));
    this.fromDate = formatDateToFr(this.startDate);
    this.toDate = formatDateToFr(this.endDate);
    this.isCustomDates = false;
    this.selectedYear = year;
    this.currentReport = this.reports.find((report) => report.year === year);

    this.compare();
  }

  public setCustomDates() {
    this.startDate = toUtcNoon(startOfMonth(new Date()));
    this.endDate = toUtcNoon(new Date());
    this.fromDate = formatDateToFr(this.startDate);
    this.toDate = formatDateToFr(this.endDate);
    this.currentReport = null;
    this.isCustomDates = true;
    this.stats = null;
  }

  public compare(): void {
    this.loading = true;
    this.stats = null;
    this.startDate = parseFrDate(this.fromDate)!;
    this.endDate = this.toDate !== null ? parseFrDate(this.toDate) : null;

    const startFormatted = format(this.startDate, "dd/MM/yyyy");
    const endFormatted = format(this.startDate, "dd/MM/yyyy");
    const requestedInterval = `${startFormatted}${
      this.endDate ? endFormatted : ""
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
        .getStats(this.me?.structureId as number, this.startDate, this.endDate)
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
