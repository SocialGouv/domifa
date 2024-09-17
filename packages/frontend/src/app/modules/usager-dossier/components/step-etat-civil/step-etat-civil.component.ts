import { EtatCivilParentFormComponent } from "./../../../usager-shared/components/etat-civil-parent-form/etat-civil-parent-form.component";
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
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
import { Usager } from "@domifa/common";
import { merge, debounceTime, distinctUntilChanged } from "rxjs";

@Component({
  animations: [fadeInOut],
  providers: [
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
    public authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    public changeDetectorRef: ChangeDetectorRef,
    private readonly usagerDossierService: UsagerDossierService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastService: CustomToastService
  ) {
    super(formBuilder, authService, changeDetectorRef);
    this.duplicates = [];
  }

  public ngOnInit(): void {
    this.currentUserSubject$ = this.authService.currentUserSubject;

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.subscription.add(
        this.usagerDossierService.findOne(id).subscribe({
          next: (usager: Usager) => {
            this.usager = new UsagerFormModel(usager);
            this.initForm();
            this.listenNameChanges();
          },
          error: () => {
            this.toastService.error("Le dossier recherché n'existe pas");
            this.router.navigate(["404"]);
          },
        })
      );
    } else {
      this.usager = new UsagerFormModel();
      this.initForm();
      this.listenNameChanges();
    }
  }

  public listenNameChanges() {
    const lastNameChanges = this.usagerForm.get("nom")!.valueChanges;
    const firstNameChanges = this.usagerForm.get("prenom")!.valueChanges;

    this.subscription.add(
      merge(lastNameChanges, firstNameChanges)
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(() => {
          this.isDuplicateName();
        })
    );
  }
  public isDuplicateName(): void {
    if (
      this.usagerForm.controls.nom?.value?.trim() &&
      this.usagerForm.controls.prenom?.value?.trim()
    ) {
      const params: {
        nom: string;
        prenom: string;
      } = {
        nom: this.usagerForm.controls.nom.value,
        prenom: this.usagerForm.controls.prenom.value,
      };

      this.subscription.add(
        this.usagerDossierService
          .isDuplicateName(params)
          .subscribe((duplicates: UsagerLight[]) => {
            this.duplicates = duplicates ?? [];
            if (this.usager?.ref && this.duplicates.length) {
              this.duplicates = this.duplicates.filter(
                (usager) => this.usager.ref !== usager.ref
              );
            }
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
          next: (usager: Usager) => {
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
}
