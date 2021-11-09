import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { addYears, subDays } from "date-fns";
import { ToastrService } from "ngx-toastr";
import {
  UsagerDecisionValideForm,
  UsagerLight,
} from "../../../../../_common/model";
import { formatDateToNgb } from "../../../../shared/bootstrap-util";
import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";

@Component({
  selector: "app-decision-valide-form",
  templateUrl: "./decision-valide-form.component.html",
  styleUrls: ["./decision-valide-form.component.css"],
})
export class DecisionValideFormComponent {
  @Input() public usager: UsagerFormModel;

  @Output() public closeModals = new EventEmitter<void>();

  public submitted: boolean;
  public loading: boolean;

  public valideForm!: FormGroup;

  public minDate: NgbDateStruct;
  public maxDate: NgbDateStruct;

  public usagersRefs: Pick<
    UsagerLight,
    "ref" | "customRef" | "nom" | "prenom" | "sexe" | "structureId"
  >[];

  constructor(
    private formBuilder: FormBuilder,
    private usagerDecisionService: UsagerDecisionService,
    private router: Router,
    private nbgDate: NgbDateCustomParserFormatter,
    private notifService: ToastrService
  ) {
    this.submitted = false;
    this.loading = false;

    this.usagersRefs = [];
    this.minDate = { day: 1, month: 1, year: new Date().getFullYear() - 1 };
    this.maxDate = { day: 31, month: 12, year: new Date().getFullYear() + 2 };
  }
  get v(): any {
    return this.valideForm.controls;
  }

  public ngOnInit() {
    this.valideForm = this.formBuilder.group({
      dateDebut: [formatDateToNgb(new Date()), [Validators.required]],
      dateFin: [
        formatDateToNgb(addYears(new Date(), 1)),
        [Validators.required],
      ],
      statut: ["VALIDE", [Validators.required]],
      customRef: [this.usager.customRef],
    });

    this.valideForm.get("dateDebut").valueChanges.subscribe((value) => {
      if (value !== null && this.nbgDate.isValid(value)) {
        const newDateFin = subDays(
          addYears(new Date(this.nbgDate.formatEn(value)), 1),
          1
        );
        this.valideForm.controls.dateFin.setValue(formatDateToNgb(newDateFin));
      }
    });

    // Affichage des 5 derniers ids
    this.getLastUsagersRefs();
  }

  public setDecisionValide() {
    this.submitted = true;
    if (this.valideForm.invalid) {
      this.notifService.error(
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
    this.usagerDecisionService
      .setDecision(this.usager.ref, formDatas)
      .subscribe({
        next: (usager: UsagerLight) => {
          this.notifService.success("Décision enregistrée avec succès ! ");
          this.router.navigate(["profil/general/" + usager.ref]);
          this.closeModals.emit();
          this.submitted = false;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.notifService.error("La décision n'a pas pu être enregistrée");
        },
      });
  }
  private getLastUsagersRefs() {
    this.usagerDecisionService.getLastFiveCustomRef(this.usager.ref).subscribe({
      next: (usagers: UsagerLight[]) => {
        this.usagersRefs = usagers;
      },
    });
  }
}
