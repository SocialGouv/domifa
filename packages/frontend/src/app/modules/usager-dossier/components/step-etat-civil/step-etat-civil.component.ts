import { EtatCivilParentFormComponent } from "./../../../usager-shared/components/etat-civil-parent-form/etat-civil-parent-form.component";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
} from "@ng-bootstrap/ng-bootstrap";

import { UsagerDossierService } from "../../services/usager-dossier.service";
import {
  UsagerLight,
  UsagerEtatCivilFormData,
} from "../../../../../_common/model";
import { fadeInOut } from "../../../../shared";
import {
  NgbDateCustomParserFormatter,
  CustomDatepickerI18n,
  AuthService,
  CustomToastService,
} from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

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
  implements OnInit, OnDestroy
{
  public duplicates: UsagerLight[];

  constructor(
    public formBuilder: UntypedFormBuilder,
    public usagerDossierService: UsagerDossierService,
    public authService: AuthService,
    public route: ActivatedRoute,
    public router: Router,
    public toastService: CustomToastService,
    public titleService: Title
  ) {
    super(formBuilder, authService);
    this.duplicates = [];
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

  public isDuplicateName(): void {
    if (
      this.usagerForm.controls.nom.value &&
      this.usagerForm.controls.prenom.value
    ) {
      const params: {
        nom: string;
        prenom: string;
        usagerRef: number | null;
      } = {
        nom: this.usagerForm.controls.nom.value,
        prenom: this.usagerForm.controls.prenom.value,
        usagerRef: this.usager.ref || null,
      };

      this.subscription.add(
        this.usagerDossierService
          .isDuplicateName(params)
          .subscribe((duplicates: UsagerLight[]) => {
            this.duplicates = duplicates;
          })
      );
    }
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

    this.subscription.add(
      this.usagerDossierService
        .editStepEtatCivil(formValue, this.usager.ref)
        .subscribe({
          next: (usager: UsagerLight) => {
            this.usager = new UsagerFormModel(usager);
            this.toastService.success("Enregistrement réussi");
            this.router.navigate([
              "usager/" + usager.ref + "/edit/rendez-vous",
            ]);
          },
          error: () => {
            this.loading = false;
            this.toastService.error(
              "Veuillez vérifier les champs du formulaire"
            );
          },
        })
    );
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
