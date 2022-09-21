import { EtatCivilParentFormComponent } from "./../etat-civil-parent-form/etat-civil-parent-form.component";
import { UsagerEtatCivilFormData } from "./../../../../../_common/model/usager/form/UsagerEtatCivilFormData.type";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { UsagerLight } from "../../../../../_common/model";

import { UsagerFormModel } from "../../interfaces";
import { EtatCivilService } from "../../services/etat-civil.service";
import { AuthService } from "../../../shared/services/auth.service";

@Component({
  selector: "app-profil-etat-civil-form",
  templateUrl: "./profil-etat-civil-form.component.html",
  styleUrls: ["./profil-etat-civil-form.component.css"],
})
export class ProfilEtatCivilFormComponent
  extends EtatCivilParentFormComponent
  implements OnInit
{
  @Input() public usager!: UsagerFormModel;
  @Output() public usagerChange = new EventEmitter<UsagerFormModel>();
  @Output() public editInfosChange = new EventEmitter<boolean>();

  constructor(
    public authService: AuthService,
    public formBuilder: FormBuilder,
    private readonly toastService: CustomToastService,
    private readonly etatCivilService: EtatCivilService
  ) {
    super(formBuilder, authService);
  }

  public ngOnInit(): void {
    this.initForm();
  }

  public updateInfos(): void {
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

    this.etatCivilService.patchEtatCivil(this.usager.ref, formValue).subscribe({
      next: (usager: UsagerLight) => {
        this.editInfosChange.emit(false);
        this.toastService.success("Enregistrement réussi");
        this.usagerChange.emit(new UsagerFormModel(usager));
        this.submitted = false;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.error("Veuillez vérifier les champs du formulaire");
      },
    });
  }
}
