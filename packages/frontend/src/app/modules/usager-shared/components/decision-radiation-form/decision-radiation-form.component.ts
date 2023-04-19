import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  AbstractControl,
  Validators,
} from "@angular/forms";
import {
  NgbDateStruct,
  NgbModal,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import {
  MOTIFS_RADIATION_LABELS,
  UsagerDecisionRadiationForm,
  UsagerLight,
} from "../../../../../_common/model";
import { minDateToday } from "../../../../shared";
import {
  NgbDateCustomParserFormatter,
  CustomToastService,
} from "../../../shared/services";
import { UsagerFormModel } from "../../interfaces";
import { UsagerDecisionService } from "../../services/usager-decision.service";

@Component({
  selector: "app-decision-radiation-form",

  templateUrl: "./decision-radiation-form.component.html",
})
export class DecisionRadiationFormComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;

  @Output() public closeModals = new EventEmitter<void>();
  @Output() public usagerChange = new EventEmitter<UsagerFormModel>();

  public submitted: boolean;
  public loading: boolean;
  public radiationForm!: UntypedFormGroup;

  public MOTIFS_RADIATION_LABELS = MOTIFS_RADIATION_LABELS;

  public minDate: NgbDateStruct;
  public maxDate: NgbDateStruct;

  private subscription = new Subscription();

  @ViewChild("decisionRadiationFormModal", { static: true })
  public decisionRadiationFormModal!: TemplateRef<NgbModalRef>;

  constructor(
    private readonly modalService: NgbModal,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly nbgDate: NgbDateCustomParserFormatter,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly toastService: CustomToastService
  ) {
    this.submitted = false;
    this.loading = false;
    this.minDate = { day: 1, month: 1, year: new Date().getFullYear() - 1 };
    this.maxDate = minDateToday;
  }

  public get r(): { [key: string]: AbstractControl } {
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

  public setDecisionRadiation(): void {
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

  public openRadiationModal(): void {
    this.modalService.open(this.decisionRadiationFormModal);
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

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
