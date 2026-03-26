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
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { format, isAfter, isBefore } from "date-fns";

import { Subject, Subscription } from "rxjs";
import { debounceTime, exhaustMap } from "rxjs/operators";
import {
  UsagerLight,
  UsagerDecisionValideForm,
} from "../../../../../_common/model";
import {
  FR_DATE_FORMAT,
  getNextYear,
  getToday,
  parseFrDate,
  formatDateToIso,
  parseDateFromIso,
} from "../../../../shared";
import { Decision, UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";
import { CustomToastService } from "../../../shared/services";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

const DATE_ERROR_MESSAGES: Record<string, string> = {
  START_DATE_EMPTY: "La date de début est obligatoire",
  START_DATE_INVALID: "La date de début est incorrecte, exemple: 20/12/1996",
  START_DATE_TOO_LOW:
    "La date de début est antérieure à la date minimale autorisée",
  START_DATE_TOO_HIGH: "La date de début dépasse la date maximale autorisée",
  END_DATE_EMPTY: "La date de fin est obligatoire",
  END_DATE_INVALID: "La date de fin est incorrecte, exemple: 20/12/1996",
  END_DATE_TOO_LOW:
    "La date de fin est antérieure à la date minimale autorisée",
  END_DATE_TOO_HIGH: "La date de fin dépasse la date maximale autorisée",
  START_DATE_MUST_BEFORE_END:
    "La date de fin doit être supérieure à la date de début",
};

const START_DATE_KEYS = [
  "START_DATE_EMPTY",
  "START_DATE_INVALID",
  "START_DATE_TOO_LOW",
  "START_DATE_TOO_HIGH",
  "START_DATE_MUST_BEFORE_END",
];

const END_DATE_KEYS = [
  "END_DATE_EMPTY",
  "END_DATE_INVALID",
  "END_DATE_TOO_LOW",
  "END_DATE_TOO_HIGH",
  "START_DATE_MUST_BEFORE_END",
];

@Component({
  selector: "app-decision-valide-form",
  templateUrl: "./decision-valide-form.component.html",
})
export class DecisionValideFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Output() public closeModals = new EventEmitter<void>();

  @ViewChild("decisionValideModal", { static: false })
  public decisionValideModal!: DsfrModalComponent;

  public modalTitle = "";
  public submitted = false;
  public loading = false;
  public valideForm!: UntypedFormGroup;

  public minDate: string;
  public maxDate: string;
  public maxEndDate: string;

  public lastDecision: Decision | null = null;
  public lastDomiciled: Pick<
    UsagerLight,
    "ref" | "customRef" | "nom" | "prenom" | "sexe" | "structureId"
  >[] = [];

  public duplicates: UsagerLight[] = [];
  private readonly subscription = new Subscription();
  private readonly submitSubject$ = new Subject<UsagerDecisionValideForm>();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly router: Router,
    private readonly toastService: CustomToastService
  ) {
    this.minDate = `${new Date().getFullYear() - 1}-01-01`;
    this.maxDate = `${new Date().getFullYear() + 1}-12-31`;
    this.maxEndDate = formatDateToIso(getNextYear(getToday()));
  }

  public get v(): { [key: string]: AbstractControl } {
    return this.valideForm.controls;
  }

  public get showDurationWarning(): boolean {
    if (!this.valideForm) {
      return false;
    }
    const dateDebut = parseFrDate(this.valideForm.get("dateDebut")?.value);
    const dateFin = parseFrDate(this.valideForm.get("dateFin")?.value);
    if (!dateDebut || !dateFin || !isBefore(dateDebut, dateFin)) {
      return false;
    }
    return isBefore(dateFin, getNextYear(dateDebut));
  }

  public getLastDecision(): void {
    const indexOfDate =
      this.usager.decision.statut === "ATTENTE_DECISION" ? 3 : 2;

    if (this.usager.historique.length >= indexOfDate) {
      this.lastDecision =
        this.usager.historique[this.usager.historique.length - indexOfDate];
    }
  }

  public ngOnInit(): void {
    const today = getToday();
    const defaultEndDate = getNextYear(today);

    this.valideForm = this.formBuilder.group(
      {
        dateDebut: [format(today, FR_DATE_FORMAT)],
        dateFin: [format(defaultEndDate, FR_DATE_FORMAT)],
        statut: ["VALIDE", [Validators.required]],
        customRef: [this.usager.customRef],
      },
      { validators: [this.datesValidator()] }
    );

    this.subscription.add(
      this.valideForm
        .get("dateDebut")
        ?.valueChanges.subscribe((value: string) => {
          const dateDebut = parseFrDate(value);
          if (dateDebut) {
            const newDateFin = getNextYear(dateDebut);
            this.maxEndDate = formatDateToIso(newDateFin);
            this.valideForm.controls.dateFin.setValue(
              format(newDateFin, FR_DATE_FORMAT),
              { emitEvent: false }
            );
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

    this.getLastDomiciled();
    this.getLastDecision();
    this.checkDuplicatesRef(this.usager.customRef);

    this.subscription.add(
      this.submitSubject$
        .pipe(
          debounceTime(300),
          exhaustMap((formDatas) =>
            this.usagerDecisionService.setDecision(this.usager.ref, formDatas)
          )
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

  public getStartDateMessage(): string {
    return this.getDateMessage("dateDebut", START_DATE_KEYS);
  }

  public getEndDateMessage(): string {
    return this.getDateMessage("dateFin", END_DATE_KEYS);
  }

  public openModal(): void {
    this.modalTitle = `Confirmer la domiciliation de ${this.usager.nom} ${this.usager.prenom}`;
    this.decisionValideModal.open();
  }

  public closeModal(): void {
    this.decisionValideModal.close();
    this.closeModals.emit();
  }

  public setDecisionValide(): void {
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
      dateDebut: parseFrDate(this.valideForm.controls.dateDebut.value),
      dateFin: parseFrDate(this.valideForm.controls.dateFin.value),
    };

    this.submitSubject$.next(formDatas);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getDateMessage(controlName: string, keys: string[]): string {
    if (!this.submitted && !this.v?.[controlName]?.touched) {
      return "";
    }
    const errors = this.valideForm?.errors;
    if (!errors) {
      return "";
    }
    for (const key of keys) {
      if (errors[key]) {
        return DATE_ERROR_MESSAGES[key];
      }
    }
    return "";
  }

  private datesValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const form = group as UntypedFormGroup;
      const errors: ValidationErrors = {};

      const dateDebutValue = form.get("dateDebut")?.value;
      const dateFinValue = form.get("dateFin")?.value;

      if (!dateDebutValue) {
        errors["START_DATE_EMPTY"] = true;
      }
      if (!dateFinValue) {
        errors["END_DATE_EMPTY"] = true;
      }

      const dateDebut = parseFrDate(dateDebutValue);
      const dateFin = parseFrDate(dateFinValue);

      if (dateDebutValue && !dateDebut) {
        errors["START_DATE_INVALID"] = true;
      }
      if (dateFinValue && !dateFin) {
        errors["END_DATE_INVALID"] = true;
      }

      if (dateDebut) {
        const min = parseDateFromIso(this.minDate);
        const max = parseDateFromIso(this.maxDate);
        if (min && isBefore(dateDebut, min)) {
          errors["START_DATE_TOO_LOW"] = true;
        }
        if (max && isAfter(dateDebut, max)) {
          errors["START_DATE_TOO_HIGH"] = true;
        }
      }

      if (dateFin) {
        const min = parseDateFromIso(this.minDate);
        const maxEnd = parseDateFromIso(this.maxEndDate);
        if (min && isBefore(dateFin, min)) {
          errors["END_DATE_TOO_LOW"] = true;
        }
        if (maxEnd && isAfter(dateFin, maxEnd)) {
          errors["END_DATE_TOO_HIGH"] = true;
        }
      }

      if (dateDebut && dateFin && !isBefore(dateDebut, dateFin)) {
        errors["START_DATE_MUST_BEFORE_END"] = true;
      }

      return Object.keys(errors).length ? errors : null;
    };
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
}
