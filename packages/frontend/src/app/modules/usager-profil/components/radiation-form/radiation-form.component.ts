import { Component, OnInit, EventEmitter, Input, Output } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";

import {
  MOTIFS_RADIATION_LABELS,
  UsagerDecisionRadiationForm,
  UsagerLight,
} from "../../../../../_common/model";
import { formatDateToNgb } from "../../../../shared/bootstrap-util";
import { usagersCache } from "../../../../shared/store";
import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter";

import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";

@Component({
  selector: "app-radiation-form",
  styleUrls: ["./radiation-form.component.css"],
  templateUrl: "./radiation-form.component.html",
})
export class RadiationFormComponent implements OnInit {
  @Input() public usager: UsagerFormModel;

  @Output() public closeModals = new EventEmitter<void>();

  @Output() public usagerChange = new EventEmitter<UsagerLight>();

  public submitted: boolean;
  public loading: boolean;
  public radiationForm!: FormGroup;

  public MOTIFS_RADIATION_LABELS = MOTIFS_RADIATION_LABELS;

  public minDate: NgbDateStruct;
  public maxDate: NgbDateStruct;

  constructor(
    private formBuilder: FormBuilder,
    private nbgDate: NgbDateCustomParserFormatter,

    private usagerDecisionService: UsagerDecisionService,
    private notifService: ToastrService
  ) {
    this.minDate = { day: 1, month: 1, year: new Date().getFullYear() - 1 };
    this.maxDate = formatDateToNgb(new Date());
  }

  get r(): { [key: string]: AbstractControl } {
    return this.radiationForm.controls;
  }

  public ngOnInit(): void {
    this.radiationForm = this.formBuilder.group({
      motif: [null, [Validators.required]],
      dateFin: [null, [Validators.required]],
      statut: ["RADIE", [Validators.required]],
      motifDetails: [null, []],
    });

    this.radiationForm.get("motif").valueChanges.subscribe((value) => {
      if (value === "AUTRE") {
        this.radiationForm
          .get("motifDetails")
          .setValidators([Validators.required, Validators.minLength(10)]);
      } else {
        this.radiationForm.get("motifDetails").setValidators(null);
        this.radiationForm.get("motifDetails").setValue(null);
      }
    });
  }

  public setDecisionRadiation() {
    this.submitted = true;
    if (this.radiationForm.invalid) {
      this.notifService.error(
        "Le formulaire contient une erreur, veuillez vérifier les champs"
      );
      return;
    }

    const formDatas: UsagerDecisionRadiationForm = {
      ...this.radiationForm.value,
      dateFin: new Date(
        this.nbgDate.formatEn(this.radiationForm.controls.dateFin.value)
      ),
    };

    this.setDecision(formDatas);
  }

  public setDecision(formDatas: UsagerDecisionRadiationForm): void {
    this.loading = true;
    this.usagerDecisionService
      .setDecision(this.usager.ref, formDatas)
      .subscribe({
        next: (newUsager: UsagerLight) => {
          this.notifService.success("Radiation enregistrée avec succès ! ");
          usagersCache.updateUsager(newUsager);
          this.closeModals.emit();
          this.loading = false;
          this.submitted = false;

          window.location.reload();
        },
        error: () => {
          this.loading = false;
          this.notifService.error("La décision n'a pas pu être enregistrée");
        },
      });
  }
}
