import { minDateToday } from "src/app/shared/bootstrap-util";
import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import {
  MOTIFS_RADIATION_LABELS,
  UsagerDecisionRadiationForm,
  UsagerLight,
} from "../../../../../_common/model";

import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter";

import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-radiation-form",
  styleUrls: ["./radiation-form.component.css"],
  templateUrl: "./radiation-form.component.html",
})
export class RadiationFormComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;

  @Output() public closeModals = new EventEmitter<void>();
  @Output() public usagerChange = new EventEmitter<UsagerFormModel>();

  public submitted: boolean;
  public loading: boolean;
  public radiationForm!: FormGroup;

  public MOTIFS_RADIATION_LABELS = MOTIFS_RADIATION_LABELS;

  public minDate: NgbDateStruct;
  public maxDate: NgbDateStruct;

  private subscription = new Subscription();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly nbgDate: NgbDateCustomParserFormatter,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly toastService: CustomToastService
  ) {
    this.submitted = false;
    this.loading = false;
    this.minDate = { day: 1, month: 1, year: new Date().getFullYear() - 1 };
    this.maxDate = minDateToday;
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

    this.subscription.add(
      this.radiationForm.get("motif")?.valueChanges.subscribe((value) => {
        if (value === "AUTRE") {
          this.radiationForm
            .get("motifDetails")
            ?.setValidators([Validators.required, Validators.minLength(10)]);
        } else {
          this.radiationForm.get("motifDetails")?.setValidators(null);
          this.radiationForm.get("motifDetails")?.setValue(null);
        }
      })
    );
  }

  public setDecisionRadiation() {
    this.submitted = true;

    if (this.radiationForm.invalid) {
      this.toastService.error(
        "Le formulaire contient une erreur, veuillez vérifier les champs"
      );
    } else {
      const formDatas: UsagerDecisionRadiationForm = {
        ...this.radiationForm.value,
        dateFin: new Date(
          this.nbgDate.formatEn(this.radiationForm.controls.dateFin.value)
        ),
      };

      this.setDecision(formDatas);
    }
  }

  public setDecision(formDatas: UsagerDecisionRadiationForm): void {
    this.loading = true;

    this.subscription.add(
      this.usagerDecisionService
        .setDecision(this.usager.ref, formDatas)
        .subscribe({
          next: (newUsager: UsagerLight) => {
            this.toastService.success("Radiation enregistrée avec succès ! ");

            setTimeout(() => {
              this.usager = new UsagerFormModel(newUsager);
              this.usagerChange.emit(this.usager);
              this.closeModals.emit();
              this.loading = false;
              this.submitted = false;
              window.location.reload();
            }, 1000);
          },
          error: () => {
            this.loading = false;
            this.toastService.error("La décision n'a pas pu être enregistrée");
          },
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
