import { UsagerService } from "./../../services/usagers.service";
import { EtatCivilParentFormComponent } from "./../etat-civil-parent-form/etat-civil-parent-form.component";
import { UsagerEtatCivilFormData } from "./../../../../../_common/model/usager/form/UsagerEtatCivilFormData.type";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";

import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { UsagerFormModel } from "../../interfaces";
import { AuthService } from "../../../shared/services/auth.service";

@Component({
  selector: "app-profil-etat-civil-form",
  templateUrl: "./profil-etat-civil-form.component.html",
})
export class ProfilEtatCivilFormComponent
  extends EtatCivilParentFormComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild("firstInput")
  public firstInput!: ElementRef;

  @Input() public usager!: UsagerFormModel;
  @Output() public editInfosChange = new EventEmitter<boolean>();

  constructor(
    public authService: AuthService,
    public formBuilder: UntypedFormBuilder,
    public changeDetectorRef: ChangeDetectorRef,
    private readonly toastService: CustomToastService,
    private readonly etatCivilService: UsagerService
  ) {
    super(formBuilder, authService, changeDetectorRef);
  }

  public ngOnInit(): void {
    this.initForm();
  }

  public ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
    const elementToFocus = this.firstInput?.nativeElement;
    if (elementToFocus) {
      elementToFocus.focus();
    }
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

    this.subscription.add(
      this.etatCivilService
        .patchEtatCivil(this.usager.ref, formValue)
        .subscribe({
          next: () => {
            this.editInfosChange.emit(false);
            this.toastService.success("Enregistrement réussi");
            this.submitted = false;
            this.loading = false;
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
