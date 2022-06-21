import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from "ngx-intl-tel-input";

import {
  UsagerLight,
  UsagerPreferenceContact,
  UserStructure,
  UserStructureRole,
} from "../../../../../_common/model";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerProfilService } from "../../services/usager-profil.service";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { PREFERRED_COUNTRIES } from "../../../../shared/constants";

@Component({
  selector: "app-profil-edit-sms-preference",
  templateUrl: "./profil-edit-sms-preference.component.html",
  styleUrls: ["./profil-edit-sms-preference.component.css"],
})
export class ProfilEditSmsPreferenceComponent implements OnInit {
  public PhoneNumberFormat = PhoneNumberFormat;
  public SearchCountryField = SearchCountryField;
  public CountryISO = CountryISO;
  public preferredCountries: CountryISO[] = PREFERRED_COUNTRIES;
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  public submitted: boolean;
  public loading: boolean;
  public preferenceForm!: FormGroup;

  public editPreferences: boolean;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly toastService: CustomToastService,
    private readonly usagerProfilService: UsagerProfilService
  ) {
    this.loading = false;
    this.submitted = false;
    this.editPreferences = false;
  }

  public ngOnInit(): void {
    // const validator = this.usager.preference.phone
    //   ? [Validators.required, Validators.pattern(regexp.mobilePhone)]
    //   : null;
    const telephoneValidator = this.usager.preference.phone
      ? [Validators.required]
      : null;

    this.preferenceForm = this.formBuilder.group({
      phone: [this.usager.preference.phone, [Validators.required]],

      telephone: this.formBuilder.control(
        {
          number: this.usager.preference.telephone?.numero || "",
          countryCode: this.usager.preference.telephone?.countryCode || "fr",
        },
        telephoneValidator
      ),
    });

    this.preferenceForm
      .get("phone")
      .valueChanges.subscribe((value: boolean) => {
        const isRequiredTelephone = value ? [Validators.required] : null;

        this.preferenceForm.get("telephone").setValidators(isRequiredTelephone);
        this.preferenceForm.get("telephone").updateValueAndValidity();
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
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
    } else {
      this.loading = true;
      const preference: UsagerPreferenceContact = {
        ...this.preferenceForm.value,
      };

      if (!preference.phone || this.preferenceForm.value.telephone === null) {
        preference.telephone = {
          countryCode: "fr",
          numero: "",
        };
      } else {
        preference.telephone = {
          countryCode: this.preferenceForm.value.telephone.countryCode,
          numero: this.preferenceForm.value.telephone.number,
        };
      }

      this.usagerProfilService
        .editSmsPreference(preference, this.usager.ref)
        .subscribe({
          next: (usager: UsagerLight) => {
            this.submitted = false;
            this.loading = false;
            this.editPreferences = false;
            this.toastService.success("Enregistrement des préférences réussi");
            this.usager = new UsagerFormModel(usager);
          },
          error: () => {
            this.loading = false;
            this.toastService.error(
              "Veuillez vérifier les champs du formulaire"
            );
          },
        });
    }
  }
}
