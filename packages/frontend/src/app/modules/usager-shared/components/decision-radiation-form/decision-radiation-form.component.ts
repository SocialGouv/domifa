import {
  Component,
  OnInit,
  Input,
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
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Subscription, concatMap, from, toArray } from "rxjs";
import {
  DEFAULT_MODAL_OPTIONS,
  UsagerDecisionRadiationForm,
  UsagerLight,
} from "../../../../../_common/model";
import { usagerActions, minDateToday } from "../../../../shared";
import {
  NgbDateCustomParserFormatter,
  CustomToastService,
} from "../../../shared/services";
import { UsagerFormModel } from "../../interfaces";
import { UsagerDecisionService } from "../../services/usager-decision.service";
import { MOTIFS_RADIATION_LABELS } from "@domifa/common";
import { Store } from "@ngrx/store";

@Component({
  selector: "app-decision-radiation-form",
  styleUrls: ["./decision-radiation-form.component.scss"],
  templateUrl: "./decision-radiation-form.component.html",
})
export class DecisionRadiationFormComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public selectedRefs: Set<number>;
  @Input() public context!: "MANAGE" | "PROFIL";

  public submitted: boolean;
  public loading: boolean;
  public radiationForm!: UntypedFormGroup;

  public readonly MOTIFS_RADIATION_LABELS = MOTIFS_RADIATION_LABELS;

  public readonly minDate = {
    day: 1,
    month: 1,
    year: new Date().getFullYear() - 1,
  };

  public readonly maxDate = minDateToday;

  private subscription = new Subscription();

  @ViewChild("decisionRadiationFormModal", { static: true })
  public decisionRadiationFormModal!: TemplateRef<NgbModalRef>;

  constructor(
    private readonly modalService: NgbModal,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly nbgDate: NgbDateCustomParserFormatter,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly toastService: CustomToastService,
    private readonly store: Store
  ) {
    this.submitted = false;
    this.loading = false;
    this.selectedRefs = new Set();
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

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public openRadiationModal(): void {
    this.modalService.open(
      this.decisionRadiationFormModal,
      DEFAULT_MODAL_OPTIONS
    );
  }

  public setDecision(formDatas: UsagerDecisionRadiationForm): void {
    this.loading = true;
    if (this.usager) {
      this.selectedRefs = new Set<number>().add(this.usager.ref);
    }

    this.subscription.add(
      from(this.selectedRefs)
        .pipe(
          concatMap((ref: number) =>
            this.usagerDecisionService.setDecision(ref, formDatas, false)
          ),
          toArray()
        )
        .subscribe({
          next: (usagers: UsagerLight[]) => {
            const message =
              this.selectedRefs.size > 1
                ? "Les dossiers sélectionnés ont été radié"
                : "Radiation enregistrée avec succès ! ";
            this.toastService.success(message);
            this.loading = false;

            this.store.dispatch(
              usagerActions.updateManyUsagersForManage({ usagers })
            );
            this.store.dispatch(
              usagerActions.updateUsagersRadiesTotalCount({
                newRadies: this.selectedRefs.size,
              })
            );

            this.modalService.dismissAll();
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
