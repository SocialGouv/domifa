import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ViewChild,
  EventEmitter,
  Output,
} from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  AbstractControl,
  Validators,
} from "@angular/forms";
import { Subject, Subscription, concatMap, from, toArray } from "rxjs";
import { debounceTime, exhaustMap } from "rxjs/operators";
import {
  UsagerDecisionRadiationForm,
  UsagerLight,
} from "../../../../../_common/model";
import {
  usagerActions,
  minDateToday,
  parseDateFromNgb,
} from "../../../../shared";
import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../interfaces";
import { UsagerDecisionService } from "../../services/usager-decision.service";
import { MOTIFS_RADIATION_LABELS } from "@domifa/common";
import { Store } from "@ngrx/store";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-decision-radiation-form",
  styleUrls: ["./decision-radiation-form.component.scss"],
  templateUrl: "./decision-radiation-form.component.html",
})
export class DecisionRadiationFormComponent implements OnInit, OnDestroy {
  @Input()
  public usager!: UsagerFormModel;

  @Input()
  public selectedRefs: Set<number>;

  @Input({ required: true })
  public context!: "MANAGE" | "PROFIL";

  @Output() public actionAfterSuccess = new EventEmitter<void>();

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

  private readonly subscription = new Subscription();
  private readonly submitSubject$ = new Subject<UsagerDecisionRadiationForm>();

  @ViewChild("decisionRadiationFormModal")
  public decisionRadiationFormModal!: DsfrModalComponent;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
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
      motif: ["", [Validators.required]],
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

    this.subscription.add(
      this.submitSubject$
        .pipe(
          debounceTime(300),
          exhaustMap((formDatas) => {
            if (!this.selectedRefs && !this.usager) {
              throw new Error("Cannot update radiation");
            }

            if (this.usager) {
              this.selectedRefs = new Set<number>().add(this.usager.ref);
            }

            return from(this.selectedRefs).pipe(
              concatMap((ref: number) =>
                this.usagerDecisionService.setDecision(ref, formDatas, false)
              ),
              toArray()
            );
          })
        )
        .subscribe({
          next: (usagers: UsagerLight[]) => {
            const message =
              usagers.length > 1
                ? "Les dossiers sélectionnés ont été radié"
                : "Radiation enregistrée avec succès ! ";

            this.store.dispatch(
              usagerActions.updateManyUsagersForManage({ usagers })
            );

            this.store.dispatch(
              usagerActions.updateUsagersRadiesTotalCount({
                action: "add",
                numberOfChanges: usagers.length,
              })
            );

            this.toastService.success(message);
            this.loading = false;

            if (this.actionAfterSuccess) {
              this.actionAfterSuccess.emit();
            }

            this.closeModals();
          },
          error: () => {
            this.loading = false;
            this.toastService.error("La décision n'a pas pu être enregistrée");
          },
        })
    );
  }

  public setDecisionRadiation(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.submitted = true;

    if (this.radiationForm.invalid) {
      this.loading = false;
      this.toastService.error(
        "Le formulaire contient une erreur, veuillez vérifier les champs"
      );
      return;
    }
    const formDatas: UsagerDecisionRadiationForm = {
      ...this.radiationForm.value,
      dateFin: parseDateFromNgb(this.radiationForm.controls.dateFin.value),
    };

    this.submitSubject$.next(formDatas);
  }

  public closeModals(): void {
    if (this.decisionRadiationFormModal) {
      this.decisionRadiationFormModal.close();
    }
  }

  public openRadiationModal(): void {
    if (this.decisionRadiationFormModal) {
      this.decisionRadiationFormModal.open();
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
