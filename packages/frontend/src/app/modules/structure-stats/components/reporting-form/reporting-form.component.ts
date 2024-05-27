import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { StructureStatsReportingQuestions } from "@domifa/common";
import { StructureStatsService } from "../../services/structure-stats.service";
import { CustomToastService } from "../../../shared/services";
import { Subscription } from "rxjs";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { DEFAULT_MODAL_OPTIONS } from "../../../../../_common/model";

@Component({
  selector: "app-reporting-form",
  templateUrl: "./reporting-form.component.html",
  styleUrls: ["./reporting-form.component.css"],
})
export class ReportingFormComponent implements OnInit {
  public structureStatsForm: FormGroup;

  private readonly subscription = new Subscription();
  public reports: StructureStatsReportingQuestions[] = [];
  public currentReport: StructureStatsReportingQuestions | null = null;
  public submitted = false;
  public loading = false;

  @ViewChild("completeReportModal", { static: true })
  public completeReportModal!: TemplateRef<NgbModalRef>;

  public get f(): { [key: string]: AbstractControl } {
    return this.structureStatsForm.controls;
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly structureStatsService: StructureStatsService,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly modalService: NgbModal
  ) {
    this.titleService.setTitle("Compléter les questions");
  }

  ngOnInit(): void {
    this.subscription.add(
      this.structureStatsService.getReportingQuestions().subscribe({
        next: (stats: StructureStatsReportingQuestions[]) => {
          console.log(stats);
          this.reports = stats;
          this.loading = false;
        },
        error: () => {
          this.toastService.error(
            "La récupération des rapports d'activité à échoué"
          );
          this.loading = false;
        },
      })
    );
  }

  public openModal(report: StructureStatsReportingQuestions): void {
    this.currentReport = report;

    this.structureStatsForm = this.fb.group({
      waitingList: [this.currentReport.waitingList],
      waitingTime: [this.currentReport.waitingTime, Validators.required],
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
    this.modalService.dismissAll();
    this.currentReport = null;
  }

  public sendQuestionsForm() {
    this.submitted = true;
    console.log(this.structureStatsForm.value);
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
            this.toastService.success("Rapport enregistré avec succès");
            this.loading = false;
          },
          error: () => {
            this.toastService.error(
              "La récupération des rapports d'activité à échoué"
            );
            this.loading = false;
          },
        })
    );
  }
}
