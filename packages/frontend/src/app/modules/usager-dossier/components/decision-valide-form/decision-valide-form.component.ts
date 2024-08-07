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
import { Subscription } from "rxjs";
import {
  UsagerLight,
  UsagerDecisionValideForm,
} from "../../../../../_common/model";
import { formatDateToNgb } from "../../../../shared";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
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

  public submitted: boolean;
  public loading: boolean;
  public valideForm!: UntypedFormGroup;

  public minDate: NgbDateStruct;
  public maxDate: NgbDateStruct;
  public maxEndDate: NgbDateStruct;
  public showDurationWarning: boolean;

  public lastDomiciled: Pick<
    UsagerLight,
    "ref" | "customRef" | "nom" | "prenom" | "sexe" | "structureId"
  >[];

  public duplicates: UsagerLight[];
  private subscription = new Subscription();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly router: Router,
    private readonly nbgDate: NgbDateCustomParserFormatter,
    private readonly toastService: CustomToastService
  ) {
    this.submitted = false;
    this.loading = false;
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
      day: parseInt(format(date, "d"), 10),
      month: parseInt(format(date, "M"), 10),
      year: parseInt(format(date, "y"), 10),
    };
  }

  public ngOnInit(): void {
    this.valideForm = this.formBuilder.group({
      dateDebut: [formatDateToNgb(new Date()), [Validators.required]],
      dateFin: [
        formatDateToNgb(subDays(addYears(new Date(), 1), 1)),
        [Validators.required],
      ],
      statut: ["VALIDE", [Validators.required]],
      customRef: [this.usager.customRef],
    });

    this.subscription.add(
      this.valideForm.get("dateDebut")?.valueChanges.subscribe((value) => {
        if (value !== null && this.nbgDate.isValid(value)) {
          const newDateDebut = new Date(this.nbgDate.formatEn(value));
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
        const dateDebut = new Date(
          this.nbgDate.formatEn(this.valideForm.get("dateDebut")?.value)
        );

        if (
          value !== null &&
          this.nbgDate.isValid(value) &&
          isBefore(
            new Date(this.nbgDate.formatEn(value)),
            subDays(addYears(dateDebut, 1), 1)
          )
        ) {
          this.showDurationWarning = true;
        } else {
          this.showDurationWarning = false;
        }
      })
    );
    this.getLastDomiciled();
    this.checkDuplicatesRef(this.usager.customRef);
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
    this.submitted = true;
    if (this.valideForm.invalid) {
      this.toastService.error(
        "Le formulaire contient une erreur, veuillez vérifier les champs"
      );
      return;
    }

    const formDatas: UsagerDecisionValideForm = {
      ...this.valideForm.value,
      dateDebut: new Date(
        this.nbgDate.formatEn(this.valideForm.controls.dateDebut.value)
      ),
      dateFin: new Date(
        this.nbgDate.formatEn(this.valideForm.controls.dateFin.value)
      ),
    };

    this.setDecision(formDatas);
  }

  public setDecision(formDatas: UsagerDecisionValideForm): void {
    this.loading = true;

    this.subscription.add(
      this.usagerDecisionService
        .setDecision(this.usager.ref, formDatas)
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
