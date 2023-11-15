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

import {
  StructureStatsFull,
  UserStructure,
} from "../../../../../_common/model";
import { StatsService } from "../../services/stats.service";
import { buildExportStructureStatsFileName } from "./services";
import {
  NgbDateCustomParserFormatter,
  CustomDatepickerI18n,
  CustomToastService,
  AuthService,
} from "../../../shared/services";

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
  public lastYear = new Date().getFullYear() - 1;
  private me!: UserStructure | null;

  private readonly subscription = new Subscription();

  constructor(
    private readonly formatter: NgbDateCustomParserFormatter,
    private readonly statsService: StatsService,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly authService: AuthService
  ) {
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
    this.titleService.setTitle("Rapport d'activité - DomiFa");
    this.me = this.authService.currentUserValue;
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
      this.statsService
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

  public compare(): void {
    this.loading = true;
    this.start = new Date(this.formatter.formatEn(this.fromDate));
    this.end =
      this.toDate !== null
        ? new Date(this.formatter.formatEn(this.toDate))
        : null;

    this.subscription.add(
      this.statsService
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
