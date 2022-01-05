import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import {
  UsagerLight,
  UsagerPreferenceContact,
  UserStructure,
  UserStructureRole,
} from "../../../../../_common/model";
import { regexp } from "../../../../shared/validators";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { UsagerProfilService } from "../../services/usager-profil.service";

@Component({
  selector: "app-profil-edit-sms-preference",
  templateUrl: "./profil-edit-sms-preference.component.html",
  styleUrls: ["./profil-edit-sms-preference.component.css"],
})
export class ProfilEditSmsPreferenceComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;
  @Input() public me: UserStructure;

  public submitted: boolean;
  public preferenceForm: FormGroup;

  public editPreferences: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private notifService: ToastrService,
    private usagerProfilService: UsagerProfilService
  ) {
    this.submitted = false;
    this.me = null;
    this.usager = null;
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

  public isRole(role: UserStructureRole) {
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
        .editSmsPreference(preference, this.usager.ref)
        .subscribe({
          next: (usager: UsagerLight) => {
            this.submitted = false;
            this.editPreferences = false;
            this.notifService.success("Enregistrement des préférences réussi");
            this.usager = new UsagerFormModel(usager);
          },
          error: () => {
            this.notifService.error(
              "Veuillez vérifier les champs du formulaire"
            );
          },
        });
    }
  }
}
