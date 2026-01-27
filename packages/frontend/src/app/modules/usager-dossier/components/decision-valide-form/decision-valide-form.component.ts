import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { addYears, subDays, format, isBefore } from "date-fns";
import { Subject, Subscription } from "rxjs";
import { debounceTime, exhaustMap } from "rxjs/operators";
import {
  UsagerLight,
  UsagerDecisionValideForm,
} from "../../../../../_common/model";
import {
  formatDateToNgb,
  getTodayNgb,
  parseDateFromNgb,
} from "../../../../shared";
import { Decision, UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";
import {
  NgbDateCustomParserFormatter,
  CustomToastService,
} from "../../../shared/services";
@Component({
  selector: "app-decision-valide-form",
  templateUrl: "./decision-valide-form.component.html",
})
export class DecisionValideFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Output() public closeModals = new EventEmitter<void>();

  public submitted: boolean = false;
  public loading: boolean = false;
  public valideForm!: UntypedFormGroup;

  public minDate: NgbDateStruct;
  public maxDate: NgbDateStruct;
  public maxEndDate: NgbDateStruct;
  public showDurationWarning: boolean;

  public lastDecision: Decision | null = null;
  public lastDomiciled: Pick<
    UsagerLight,
    "ref" | "customRef" | "nom" | "prenom" | "sexe" | "structureId"
  >[];

  public duplicates: UsagerLight[];
  private readonly subscription = new Subscription();
  private readonly submitSubject$ = new Subject<UsagerDecisionValideForm>();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly router: Router,
    private readonly nbgDate: NgbDateCustomParserFormatter,
    private readonly toastService: CustomToastService
  ) {
    this.duplicates = [];
    this.lastDomiciled = [];

    this.minDate = { day: 1, month: 1, year: new Date().getFullYear() - 1 };
    this.maxDate = { day: 31, month: 12, year: new Date().getFullYear() + 2 };
    this.maxEndDate = this.setDate(subDays(addYears(new Date(), 1), 1));
    this.showDurationWarning = false;
  }

  public get v(): { [key: string]: AbstractControl } {
    return this.valideForm.controls;
  }

  private setDate(date: Date) {
    return {
      day: Number.parseInt(format(date, "d"), 10),
      month: Number.parseInt(format(date, "M"), 10),
      year: Number.parseInt(format(date, "y"), 10),
    };
  }

  public getLastDecision() {
    const indexOfDate =
      this.usager.decision.statut === "ATTENTE_DECISION" ? 3 : 2;

    if (indexOfDate && this.usager.historique.length >= indexOfDate) {
      this.lastDecision =
        this.usager.historique[this.usager.historique.length - indexOfDate];
    }
  }

  public ngOnInit(): void {
    this.valideForm = this.formBuilder.group({
      dateDebut: [getTodayNgb(), [Validators.required]],
      dateFin: [getTodayNgb(), [Validators.required]],
      statut: ["VALIDE", [Validators.required]],
      customRef: [this.usager.customRef],
    });

    this.subscription.add(
      this.valideForm.get("dateDebut")?.valueChanges.subscribe((value) => {
        if (value !== null && this.nbgDate.isValid(value)) {
          const newDateDebut = new Date(
            value.year,
            value.month - 1,
            value.day,
            12,
            0,
            0
          );
          const newDateFin = subDays(addYears(newDateDebut, 1), 1);

          this.valideForm.controls.dateFin.setValue(
            formatDateToNgb(newDateFin)
          );
          this.maxEndDate = this.setDate(subDays(addYears(newDateDebut, 1), 1));
        }
      })
    );

    this.subscription.add(
      this.valideForm.get("customRef")?.valueChanges.subscribe((value) => {
        if (value?.trim()) {
          this.checkDuplicatesRef(value);
        } else {
          this.duplicates = [];
        }
      })
    );

    this.subscription.add(
      this.valideForm.get("dateFin")?.valueChanges.subscribe((value) => {
        const dateDebut = parseDateFromNgb(
          this.valideForm.get("dateDebut")?.value
        );

        if (
          value !== null &&
          this.nbgDate.isValid(value) &&
          isBefore(parseDateFromNgb(value), subDays(addYears(dateDebut, 1), 1))
        ) {
          this.showDurationWarning = true;
        } else {
          this.showDurationWarning = false;
        }
      })
    );
    this.getLastDomiciled();
    this.getLastDecision();
    this.checkDuplicatesRef(this.usager.customRef);

    // Protection contre les soumissions multiples avec debounceTime + exhaustMap
    this.subscription.add(
      this.submitSubject$
        .pipe(
          debounceTime(300), // Ignore les clics rapides (< 300ms)
          exhaustMap((formDatas) => {
            // exhaustMap ignore les nouveaux appels tant que la requête précédente n'est pas terminée
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

  private checkDuplicatesRef(value: string): void {
    this.subscription.add(
      this.usagerDecisionService
        .isDuplicateCustomRef(this.usager.ref, value)
        .subscribe((duplicates: UsagerLight[]) => {
          this.duplicates = duplicates;
        })
    );
  }
  public setDecisionValide() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.submitted = true;

    if (this.valideForm.invalid) {
      this.loading = false;
      this.toastService.error(
        "Le formulaire contient une erreur, veuillez vérifier les champs"
      );
      return;
    }

    const formDatas: UsagerDecisionValideForm = {
      ...this.valideForm.value,
      dateDebut: new Date(
        this.valideForm.controls.dateDebut.value.year,
        this.valideForm.controls.dateDebut.value.month - 1,
        this.valideForm.controls.dateDebut.value.day,
        12,
        0,
        0
      ),
      dateFin: new Date(
        this.valideForm.controls.dateFin.value.year,
        this.valideForm.controls.dateFin.value.month - 1,
        this.valideForm.controls.dateFin.value.day,
        12,
        0,
        0
      ),
    };

    // Émettre vers le Subject pour bénéficier du debounceTime + exhaustMap
    this.submitSubject$.next(formDatas);
  }

  private getLastDomiciled(): void {
    this.subscription.add(
      this.usagerDecisionService
        .getLastFiveCustomRef(this.usager.ref)
        .subscribe({
          next: (usagers: UsagerLight[]) => {
            this.lastDomiciled = usagers;
          },
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
