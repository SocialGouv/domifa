import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { Router } from "@angular/router";
import {
  UsagerDecisionRefusForm,
  UsagerLight,
} from "../../../../../_common/model";
import {
  getTodayFr,
  getTodayIso,
  NoWhiteSpaceValidator,
  parseFrDate,
} from "../../../../shared";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";
import { Subject, Subscription } from "rxjs";
import { debounceTime, exhaustMap } from "rxjs/operators";

import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { MOTIFS_REFUS_LABELS } from "@domifa/common";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-decision-refus-form",
  templateUrl: "./decision-refus-form.component.html",
  standalone: false,
})
export class DecisionRefusFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Input({ required: true }) public template: "modal" | "input" = "input";
  @Output() public closeModals = new EventEmitter<void>();

  @ViewChild("decisionRefusModal", { static: false })
  public decisionRefusModal!: DsfrModalComponent;

  public readonly MOTIFS_REFUS_LABELS = MOTIFS_REFUS_LABELS;

  public submitted: boolean;
  public loading: boolean;

  public refusForm!: UntypedFormGroup;

  public maxDateRefus: string;
  public minDate: string;

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
    this.minDate = `${new Date().getFullYear() - 2}-01-01`;
    this.maxDateRefus = getTodayIso();
  }

  public get r(): { [key: string]: AbstractControl } {
    return this.refusForm.controls;
  }

  public ngOnInit() {
    this.refusForm = this.formBuilder.group({
      dateFin: [getTodayFr(), [Validators.required]],
      motif: [null, [Validators.required]],
      statut: ["REFUS", [Validators.required]],
      motifDetails: [null, []],
      orientation: [null, [Validators.required]],
      orientationDetails: [
        null,
        [
          Validators.required,
          NoWhiteSpaceValidator,
          Validators.minLength(5),
          Validators.maxLength(1000),
        ],
      ],
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
              Validators.maxLength(1000),
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
      dateFin: parseFrDate(this.refusForm.controls.dateFin.value),
    };

    this.submitSubject$.next(formDatas);
  }

  public openModal(): void {
    this.decisionRefusModal.open();
  }

  public closeModal(): void {
    this.decisionRefusModal.close();
    this.closeModals.emit();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
