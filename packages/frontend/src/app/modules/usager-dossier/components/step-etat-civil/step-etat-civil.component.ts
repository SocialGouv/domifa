import { EtatCivilParentFormComponent } from "./../../../usager-shared/components/etat-civil-parent-form/etat-civil-parent-form.component";
import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
} from "@ng-bootstrap/ng-bootstrap";

import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import {
  UsagerLight,
  UsagerEtatCivilFormData,
} from "../../../../../_common/model";
import { fadeInOut } from "../../../../shared";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { UsagerDossierService } from "../../services/usager-dossier.service";

@Component({
  animations: [fadeInOut],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-step-etat-civil",
  styleUrls: ["./step-etat-civil.component.css"],
  templateUrl: "./step-etat-civil.component.html",
})
export class StepEtatCivilComponent
  extends EtatCivilParentFormComponent
  implements OnInit
{
  public doublons: UsagerLight[];

  constructor(
    public formBuilder: FormBuilder,
    public usagerDossierService: UsagerDossierService,
    public authService: AuthService,
    public route: ActivatedRoute,
    public router: Router,
    public toastService: CustomToastService,
    public titleService: Title
  ) {
    super(formBuilder, authService);
    this.doublons = [];
  }

  public ngOnInit(): void {
    this.titleService.setTitle("État civil du demandeur");
    this.currentUserSubject$ = this.authService.currentUserSubject;

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerDossierService.findOne(id).subscribe({
        next: (usager: UsagerLight) => {
          this.usager = new UsagerFormModel(usager);
          this.initForm();
        },
        error: () => {
          this.router.navigate(["404"]);
        },
      });
    } else {
      this.usager = new UsagerFormModel();
      this.initForm();
    }
  }

  public isDoublon(): boolean {
    if (
      this.usagerForm.controls.nom.value !== "" &&
      this.usagerForm.controls.prenom.value !== "" &&
      this.usagerForm.controls.nom.value !== null &&
      this.usagerForm.controls.nom.value &&
      this.usagerForm.controls.prenom.value !== null &&
      this.usagerForm.controls.prenom.value
    ) {
      this.usagerDossierService
        .isDoublon(
          this.usagerForm.controls.nom.value,
          this.usagerForm.controls.prenom.value,
          this.usager.ref
        )
        .subscribe((usagersDoublon: UsagerLight[]) => {
          this.doublons = [];
          if (usagersDoublon.length !== 0) {
            this.toastService.warning("Un homonyme potentiel a été détecté !");
            usagersDoublon.forEach((doublon: UsagerLight) => {
              this.doublons.push(doublon);
            });
          }
        });
    }
    return false;
  }

  public submitInfos(): void {
    this.submitted = true;

    if (this.usagerForm.invalid) {
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      return;
    }
    this.loading = true;

    const formValue: UsagerEtatCivilFormData = this.getEtatCivilForm(
      this.usagerForm.value
    );

    this.usagerDossierService
      .editStepEtatCivil(formValue, this.usager.ref)
      .subscribe({
        next: (usager: UsagerLight) => {
          this.usager = new UsagerFormModel(usager);
          this.toastService.success("Enregistrement réussi");
          this.router.navigate(["usager/" + usager.ref + "/edit/rendez-vous"]);
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Veuillez vérifier les champs du formulaire");
        },
      });
  }

  public onUsagerChanges(usager: UsagerLight): void {
    this.usager = new UsagerFormModel(usager);
  }
}
