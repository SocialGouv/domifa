import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";

import {
  StructureStatsReportingQuestions,
  REPORTNG_QUESTIONS_LABELS,
  WAITING_TIME_LABELS,
  UserStructure,
} from "@domifa/common";
import { StructureStatsService } from "../../services/structure-stats.service";
import { AuthService, CustomToastService } from "../../../shared/services";
import { Subscription } from "rxjs";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { DEFAULT_MODAL_OPTIONS } from "../../../../../_common/model";
import { MatomoTracker } from "ngx-matomo-client";
import { valueInArrayValidator } from "../../../../shared";

@Component({
  selector: "app-reporting-form",
  templateUrl: "./reporting-form.component.html",
  styleUrls: ["./reporting-form.component.css"],
})
export class ReportingFormComponent implements OnInit {
  public structureStatsForm: FormGroup;

  private readonly subscription = new Subscription();
  @Input({ required: true }) currentReport: StructureStatsReportingQuestions;
  @Output() getReportings = new EventEmitter<void>();

  public readonly REPORTNG_QUESTIONS_LABELS = REPORTNG_QUESTIONS_LABELS;
  public readonly WAITING_TIME_LABELS = WAITING_TIME_LABELS;
  public submitted = false;
  public loading = false;
  public me: UserStructure | null;
  @ViewChild("completeReportModal", { static: true })
  public completeReportModal!: TemplateRef<NgbModalRef>;

  public get f(): { [key: string]: AbstractControl } {
    return this.structureStatsForm.controls;
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly structureStatsService: StructureStatsService,
    private readonly toastService: CustomToastService,
    private readonly modalService: NgbModal,
    private readonly matomo: MatomoTracker,
    private readonly authService: AuthService
  ) {
    this.me = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.loading = false;
  }

  public openModal(): void {
    this.matomo.trackEvent("STATS", "ANNUAL_REPORT_FORM", "START", 1);

    this.structureStatsForm = this.fb.group({
      waitingList: [this.currentReport.waitingList, Validators.required],
      waitingTime: [
        this.currentReport.waitingTime,
        [
          Validators.required,
          valueInArrayValidator(Object.keys(WAITING_TIME_LABELS)),
        ],
      ],
      workers: [
        this.currentReport.workers,
        [Validators.required, Validators.min(0)],
      ],
      volunteers: [
        this.currentReport.volunteers,
        [Validators.required, Validators.min(0)],
      ],
      humanCosts: [
        this.currentReport.humanCosts,
        [Validators.required, Validators.min(0)],
      ],
      totalCosts: [
        this.currentReport.totalCosts,
        [Validators.required, Validators.min(0)],
      ],
      year: [
        this.currentReport.year,
        [
          Validators.required,
          Validators.min(2020),
          Validators.max(new Date().getFullYear()),
        ],
      ],
    });
    this.modalService.open(this.completeReportModal, {
      ...DEFAULT_MODAL_OPTIONS,
      keyboard: false,
    });
  }

  public closeModal(): void {
    this.submitted = false;
    this.modalService.dismissAll();
  }

  public sendQuestionsForm() {
    this.submitted = true;

    if (!this.structureStatsForm.valid) {
      this.toastService.error(
        "Le formulaire contient des erreurs, veuillez vérifier les champs"
      );
      return;
    }

    this.loading = true;
    this.subscription.add(
      this.structureStatsService
        .setReportingQuestions(this.structureStatsForm.value)
        .subscribe({
          next: () => {
            this.matomo.trackEvent(
              "STATS",
              "ANNUAL_REPORT_FORM",
              "COMPLETE",
              1
            );

            this.toastService.success("Rapport enregistré avec succès");
            this.loading = false;
            this.submitted = false;
            this.closeModal();
            this.getReportings.emit();
          },
          error: () => {
            this.toastService.error(
              "L'enregistrement du rapport d'activité a échoué"
            );
            this.loading = false;
          },
        })
    );
  }
}
