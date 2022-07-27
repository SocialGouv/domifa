import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
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
import { getFormPhone, setFormPhone } from "../../../../shared";
import { mobilePhoneValidator } from "../../../../shared/validators/mobilePhone.validator";

@Component({
  selector: "app-profil-edit-sms-preference",
  templateUrl: "./profil-edit-sms-preference.component.html",
  styleUrls: ["./profil-edit-sms-preference.component.css"],
})
export class ProfilEditSmsPreferenceComponent implements OnInit {
  public PhoneNumberFormat = PhoneNumberFormat;
  public SearchCountryField = SearchCountryField;
  public CountryISO = CountryISO;
  public PREFERRED_COUNTRIES: CountryISO[] = PREFERRED_COUNTRIES;

  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  @Output() usagerChange = new EventEmitter<UsagerFormModel>();

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

  public ngOnInit(): void {}

  public togglePreferences(): void {
    this.editPreferences = !this.editPreferences;
    if (this.editPreferences) {
      this.initForm();
    }
  }
  public initForm(): void {
    const telephoneValidator = this.usager.preference.contactByPhone
      ? [Validators.required, mobilePhoneValidator]
      : null;

    const telephone =
      this.usager.preference.telephone.numero &&
      this.usager.preference.telephone.numero !== ""
        ? this.usager.preference.telephone
        : this.usager.telephone;

    if (
      this.usager.preference.telephone.numero === "" ||
      this.usager.preference.telephone.numero === null
    ) {
      this.usager.preference.telephone.countryCode = this.me?.structure
        .telephone.countryCode as CountryISO;
    }

    this.preferenceForm = this.formBuilder.group({
      contactByPhone: [
        this.usager.preference.contactByPhone,
        [Validators.required],
      ],
      telephone: new FormControl(setFormPhone(telephone), telephoneValidator),
    });

    this.preferenceForm
      .get("contactByPhone")
      .valueChanges.subscribe((value: boolean) => {
        const isRequiredTelephone = value
          ? [Validators.required, mobilePhoneValidator]
          : null;

        this.preferenceForm.get("telephone").setValidators(isRequiredTelephone);
        this.preferenceForm.get("telephone").updateValueAndValidity();
      });
  }

  get formPref() {
    return this.preferenceForm.controls;
  }

  public isRole(role: UserStructureRole): boolean {
    return this.me?.role === role;
  }

  public updateUsagerPreference(): void {
    this.submitted = true;

    if (this.preferenceForm.invalid) {
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      return;
    }

    this.loading = true;

    const preference: UsagerPreferenceContact = {
      contactByPhone: this.preferenceForm.get("contactByPhone").value,
      telephone: {
        countryCode: CountryISO.France,
        numero: "",
      },
    };

    if (preference.contactByPhone) {
      preference.telephone = getFormPhone(this.preferenceForm.value?.telephone);
    }

    this.usagerProfilService
      .editSmsPreference(preference, this.usager.ref)
      .subscribe({
        next: (usager: UsagerLight) => {
          this.submitted = false;
          this.loading = false;
          this.editPreferences = false;
          this.toastService.success("Enregistrement des préférences réussi");
          this.preferenceForm.reset();
          this.usager = new UsagerFormModel(usager);
          this.usagerChange.emit(this.usager);
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Veuillez vérifier les champs du formulaire");
        },
      });
  }
}
