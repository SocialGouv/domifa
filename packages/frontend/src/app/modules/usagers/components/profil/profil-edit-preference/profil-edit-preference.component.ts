import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Component, Input, OnInit } from "@angular/core";
import { AppUser, UsagerLight } from "../../../../../../_common/model";
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
    this.initForms();

    if (!this.usager.preference.phoneNumber) {
      this.usager.preference.phoneNumber = this.usager.phone;
    }
  }

  get formPref() {
    return this.preferenceForm.controls;
  }

  public initForms() {
    this.preferenceForm = this.formBuilder.group({
      phoneNumber: [
        this.usager.preference.phoneNumber,
        [Validators.pattern(regexp.mobilePhone)],
      ],
      phone: [this.usager.preference.phone, [Validators.required]],
    });
  }

  public updateUsagerPreference() {
    this.submitted = true;
    if (this.preferenceForm.invalid) {
      this.notifService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
    } else {
      const preference: Pick<UsagerLight, "preference"> = {
        ...this.preferenceForm.value,
        email: false,
      };

      this.usagerService.editPreference(preference, this.usager.ref).subscribe(
        (usager: UsagerLight) => {
          this.submitted = false;
          this.editPreferences = false;
          this.notifService.success("Enregistrement réussi");
          this.usager = new UsagerFormModel(usager);
        },
        (error) => {
          this.notifService.error("Veuillez vérifiez les champs du formulaire");
        }
      );
    }
  }
}
