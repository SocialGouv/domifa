import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Component, Input, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import {
  AppUser,
  UserRole,
  UsagerPreferenceContact,
  UsagerLight,
} from "../../../../../_common/model";
import { regexp } from "../../../../shared/validators";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { UsagerProfilService } from "../../services/usager-profil.service";

@Component({
  selector: "app-profil-edit-preference",
  templateUrl: "./profil-edit-preference.component.html",
  styleUrls: ["./profil-edit-preference.component.css"],
})
export class ProfilEditPreferenceComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;
  @Input() public me: AppUser;

  public submitted: boolean;
  public preferenceForm: FormGroup;

  public editPreferences: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private notifService: ToastrService,
    private usagerProfilService: UsagerProfilService
  ) {
    this.submitted = false;
    this.editPreferences = false;
  }

  public ngOnInit(): void {
    const validator = this.usager.preference.phone
      ? [Validators.required, Validators.pattern(regexp.mobilePhone)]
      : null;

    this.preferenceForm = this.formBuilder.group({
      phoneNumber: [this.usager.preference.phoneNumber, validator],
      phone: [this.usager.preference.phone, [Validators.required]],
    });

    this.preferenceForm
      .get("phone")
      .valueChanges.subscribe((value: boolean) => {
        const isRequired =
          value === true
            ? [Validators.required, Validators.pattern(regexp.mobilePhone)]
            : null;

        this.preferenceForm.get("phoneNumber").setValidators(isRequired);

        this.preferenceForm.get("phoneNumber").updateValueAndValidity();
      });
  }

  get formPref() {
    return this.preferenceForm.controls;
  }

  public isRole(role: UserRole) {
    return this.me?.role === role;
  }

  public updateUsagerPreference() {
    this.submitted = true;
    if (this.preferenceForm.invalid) {
      this.notifService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
    } else {
      const preference: UsagerPreferenceContact = {
        ...this.preferenceForm.value,
        email: false,
      };

      if (!preference.phone) {
        preference.phoneNumber = null;
      }

      this.usagerProfilService
        .editPreference(preference, this.usager.ref)
        .subscribe(
          (usager: UsagerLight) => {
            this.submitted = false;
            this.editPreferences = false;
            this.notifService.success("Enregistrement des préférences réussi");
            this.usager = new UsagerFormModel(usager);
          },
          (error) => {
            this.notifService.error(
              "Veuillez vérifiez les champs du formulaire"
            );
          }
        );
    }
  }
}
