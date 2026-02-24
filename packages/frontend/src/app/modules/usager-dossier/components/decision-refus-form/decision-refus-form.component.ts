import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { Router } from "@angular/router";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import {
  UsagerDecisionRefusForm,
  UsagerLight,
} from "../../../../../_common/model";
import {
  formatDateToNgb,
  minDateToday,
  parseDateFromNgb,
} from "../../../../shared/bootstrap-util";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";
import { Subject, Subscription } from "rxjs";
import { debounceTime, exhaustMap } from "rxjs/operators";
import { NoWhiteSpaceValidator } from "../../../../shared";
import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { MOTIFS_REFUS_LABELS } from "@domifa/common";

@Component({
  selector: "app-decision-refus-form",
  templateUrl: "./decision-refus-form.component.html",
})
export class DecisionRefusFormComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Output() public closeModals = new EventEmitter<void>();

  public readonly MOTIFS_REFUS_LABELS = MOTIFS_REFUS_LABELS;

  public submitted: boolean;
  public loading: boolean;

  public refusForm!: UntypedFormGroup;

  public maxDateRefus: NgbDateStruct;
  public minDate: NgbDateStruct;

  private readonly subscription = new Subscription();
  private readonly submitSubject$ = new Subject<UsagerDecisionRefusForm>();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly router: Router,
    private readonly toastService: CustomToastService
  ) {
    this.loading = false;
    this.submitted = false;
    this.minDate = { day: 1, month: 1, year: new Date().getFullYear() - 1 };
    this.maxDateRefus = minDateToday;
  }

  public get r(): { [key: string]: AbstractControl } {
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

    this.subscription.add(
      this.refusForm.get("motif")?.valueChanges.subscribe((value) => {
        if (value === "AUTRE") {
          this.refusForm
            .get("motifDetails")
            ?.setValidators([
              Validators.required,
              NoWhiteSpaceValidator,
              Validators.minLength(10),
            ]);
        } else {
          this.refusForm.get("motifDetails")?.setValidators(null);
          this.refusForm.get("motifDetails")?.setValue(null);
        }
      })
    );

    // Protection contre les soumissions multiples avec debounceTime + exhaustMap
    this.subscription.add(
      this.submitSubject$
        .pipe(
          debounceTime(300),
          exhaustMap((formDatas) => {
            return this.usagerDecisionService.setDecision(
              this.usager.ref,
              formDatas
            );
          })
        )
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
        })
    );
  }

  public setDecisionRefus() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.submitted = true;

    if (this.refusForm.invalid) {
      this.loading = false;
      this.toastService.error(
        "Le formulaire contient une erreur, veuillez vérifier les champs"
      );
      return;
    }

    const formDatas: UsagerDecisionRefusForm = {
      ...this.refusForm.value,
      dateFin: parseDateFromNgb(this.refusForm.controls.dateFin.value),
    };

    this.submitSubject$.next(formDatas);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
