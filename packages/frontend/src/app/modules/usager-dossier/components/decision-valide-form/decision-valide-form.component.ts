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
import { NgbDate, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { isBefore } from "date-fns";

import { Subject, Subscription } from "rxjs";
import { debounceTime, exhaustMap } from "rxjs/operators";
import {
  UsagerLight,
  UsagerDecisionValideForm,
} from "../../../../../_common/model";
import {
  formatDateToNgb,
  getNextYear,
  getToday,
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
  @Input() public usager!: UsagerFormModel;
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
    this.maxEndDate = formatDateToNgb(getNextYear(getToday()));
    this.showDurationWarning = false;
  }

  public get v(): { [key: string]: AbstractControl } {
    return this.valideForm.controls;
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
    const defaultEndDate = getNextYear(getToday());

    this.valideForm = this.formBuilder.group({
      dateDebut: [getTodayNgb(), [Validators.required]],
      dateFin: [formatDateToNgb(defaultEndDate), [Validators.required]],
      statut: ["VALIDE", [Validators.required]],
      customRef: [this.usager.customRef],
    });

    this.subscription.add(
      this.valideForm.get("dateDebut")?.valueChanges.subscribe((value) => {
        if (value !== null && this.nbgDate.isValid(value)) {
          const newDateFin = getNextYear(
            parseDateFromNgb(new NgbDate(value.year, value.month, value.day))
          );
          this.valideForm.controls.dateFin.setValue(
            formatDateToNgb(newDateFin)
          );
          this.maxEndDate = formatDateToNgb(newDateFin);
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
        this.showDurationWarning = this.updateDurationWarning(value);
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

  public updateDurationWarning(value: NgbDateStruct | null): boolean {
    if (!value || !this.nbgDate.isValid(value)) {
      return false;
    }
    const dateDebut = parseDateFromNgb(this.valideForm.get("dateDebut")?.value);
    return isBefore(
      parseDateFromNgb(new NgbDate(value.year, value.month, value.day)),
      getNextYear(dateDebut)
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
      dateDebut: parseDateFromNgb(this.valideForm.controls.dateDebut.value),
      dateFin: parseDateFromNgb(this.valideForm.controls.dateFin.value),
    };

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
