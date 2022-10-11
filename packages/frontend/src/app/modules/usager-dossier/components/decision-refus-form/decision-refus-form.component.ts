import { minDateToday } from "src/app/shared/bootstrap-util";
import { UsagerFormModel } from "./../../../usager-shared/interfaces/UsagerFormModel";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { Router } from "@angular/router";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import {
  MOTIFS_REFUS_LABELS,
  UsagerDecisionRefusForm,
  UsagerLight,
} from "../../../../../_common/model";
import { formatDateToNgb } from "../../../../shared/bootstrap-util";
import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";

@Component({
  selector: "app-decision-refus-form",
  templateUrl: "./decision-refus-form.component.html",
  styleUrls: ["./decision-refus-form.component.css"],
})
export class DecisionRefusFormComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;

  @Output() public closeModals = new EventEmitter<void>();

  public MOTIFS_REFUS_LABELS = MOTIFS_REFUS_LABELS;

  public submitted: boolean;
  public loading: boolean;

  public refusForm!: FormGroup;

  public maxDateRefus: NgbDateStruct;
  public minDate: NgbDateStruct;

  constructor(
    private formBuilder: FormBuilder,
    private usagerDecisionService: UsagerDecisionService,
    private router: Router,
    private nbgDate: NgbDateCustomParserFormatter,
    private toastService: CustomToastService
  ) {
    this.loading = false;
    this.submitted = false;
    this.minDate = { day: 1, month: 1, year: new Date().getFullYear() - 1 };
    this.maxDateRefus = minDateToday;
  }

  get r(): { [key: string]: AbstractControl } {
    return this.refusForm.controls;
  }

  public ngOnInit() {
    this.refusForm = this.formBuilder.group({
      dateFin: [formatDateToNgb(new Date()), [Validators.required]],
      motif: [null, [Validators.required]],
      statut: ["REFUS", [Validators.required]],
      motifDetails: [null, []],
      orientation: [null, [Validators.required]],
      orientationDetails: [null, [Validators.required]],
    });

    this.refusForm.get("motif")?.valueChanges.subscribe((value) => {
      if (value === "AUTRE") {
        this.refusForm
          .get("motifDetails")
          ?.setValidators([Validators.required, Validators.minLength(10)]);
      } else {
        this.refusForm.get("motifDetails")?.setValidators(null);
        this.refusForm.get("motifDetails")?.setValue(null);
      }
    });
  }

  public setDecisionRefus() {
    this.submitted = true;
    if (this.refusForm.invalid) {
      this.toastService.error(
        "Le formulaire contient une erreur, veuillez vérifier les champs"
      );
      return;
    }

    const formDatas: UsagerDecisionRefusForm = {
      ...this.refusForm.value,
      dateFin: new Date(
        this.nbgDate.formatEn(this.refusForm.controls.dateFin.value) as string
      ),
    };

    this.setDecision(formDatas);
  }

  public setDecision(formDatas: UsagerDecisionRefusForm): void {
    this.loading = true;
    this.usagerDecisionService
      .setDecision(this.usager.ref, formDatas)
      .subscribe({
        next: (usager: UsagerLight) => {
          this.toastService.success("Décision enregistrée avec succès ! ");
          this.router.navigate(["profil/general/" + usager.ref]);
          this.closeModals.emit();
          this.submitted = false;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastService.error("La décision n'a pas pu être enregistrée");
        },
      });
  }
}
