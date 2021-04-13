import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Component, Input, OnInit } from "@angular/core";
import {
  AppUser,
  UsagerLight,
  UsagerPreferenceContact,
} from "../../../../../../_common/model";
import { regexp } from "../../../../../shared/validators";
import { UsagerFormModel } from "../../form/UsagerFormModel";
import { ToastrService } from "ngx-toastr";
import { UsagerService } from "../../../services/usager.service";

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
    private usagerService: UsagerService
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

      this.usagerService.editPreference(preference, this.usager.ref).subscribe(
        (usager: UsagerLight) => {
          this.submitted = false;
          this.editPreferences = false;
          this.notifService.success("Enregistrement des préférences réussi");
          this.usager = new UsagerFormModel(usager);
        },
        (error) => {
          this.notifService.error("Veuillez vérifiez les champs du formulaire");
        }
      );
    }
  }
}
