import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  FormGroup,
  UntypedFormBuilder,
  AbstractControl,
  Validators,
} from "@angular/forms";
import {
  PHONE_PLACEHOLDERS,
  PREFERRED_COUNTRIES,
  Telephone,
  UsagerEtatCivilFormData,
} from "../../../../../_common/model";

import {
  setFormPhone,
  mobilePhoneValidator,
  getFormPhone,
} from "../../../shared/phone";
import { AuthService, CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../interfaces";
import { UsagerService } from "../../services";
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from "@khazii/ngx-intl-tel-input";

import { Observable, Subscription } from "rxjs";
import { EmailValidator } from "../../../../shared";
import { UserStructure } from "@domifa/common";

@Component({
  selector: "app-form-contact-details",
  templateUrl: "./form-contact-details.component.html",
  styleUrls: ["./form-contact-details.component.css"],
})
export class FormContactDetailsComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Output() public readonly editContactDetailsChange =
    new EventEmitter<boolean>();

  public contactDetailsForm!: FormGroup;
  // skipcq: JS-0331
  public mobilePhonePlaceHolder = "";
  public currentUserSubject$: Observable<UserStructure | null>;

  public loading = false;
  public submitted = false;
  private readonly subscription = new Subscription();

  public PhoneNumberFormat = PhoneNumberFormat;
  public SearchCountryField = SearchCountryField;
  public CountryISO = CountryISO;
  public PREFERRED_COUNTRIES: CountryISO[] = PREFERRED_COUNTRIES;

  constructor(
    private readonly authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastService: CustomToastService,
    private readonly etatCivilService: UsagerService
  ) {
    this.currentUserSubject$ = this.authService.currentUserSubject;
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.contactDetailsForm.controls;
  }

  public ngOnInit(): void {
    this.initContactDetailsForm();
  }

  public initContactDetailsForm() {
    this.contactDetailsForm = this.formBuilder.group({
      email: [this.usager.email, [EmailValidator]],
      contactByPhone: [this.usager.contactByPhone, [Validators.required]],
      telephone: [
        setFormPhone(this.usager.telephone),
        this.usager.contactByPhone
          ? [Validators.required, mobilePhoneValidator]
          : [mobilePhoneValidator],
      ],
    });

    this.subscription.add(
      this.contactDetailsForm
        .get("contactByPhone")
        ?.valueChanges.subscribe((value: boolean) => {
          const isRequiredTelephone = value
            ? [Validators.required, mobilePhoneValidator]
            : [mobilePhoneValidator];

          this.contactDetailsForm
            .get("telephone")
            ?.setValidators(isRequiredTelephone);
          this.contactDetailsForm.get("telephone")?.updateValueAndValidity();
        })
    );

    this.updatePlaceHolder(
      this.contactDetailsForm.value?.telephone?.countryCode
    );
  }

  public updatePlaceHolder(country: string): void {
    if (!country) {
      country =
        this.contactDetailsForm.value?.telephone?.countryCode ||
        this.usager?.telephone?.countryCode;
    }

    if (!country) {
      country = this.authService.currentUserValue?.structure.telephone
        .countryCode as CountryISO;
    }

    country = country.toLowerCase();

    this.mobilePhonePlaceHolder =
      typeof PHONE_PLACEHOLDERS[country] !== "undefined"
        ? PHONE_PLACEHOLDERS[country]
        : "";
  }

  public updateInfos(): void {
    this.submitted = true;

    if (this.contactDetailsForm.invalid) {
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      return;
    }
    const formValue = this.contactDetailsForm.value;

    const telephone: Telephone = !formValue?.telephone
      ? {
          countryCode: CountryISO.France,
          numero: "",
        }
      : getFormPhone(formValue.telephone);

    const form: Pick<
      UsagerEtatCivilFormData,
      "telephone" | "contactByPhone" | "email"
    > = {
      email: formValue?.email.toLowerCase().trim() ?? null,
      telephone,
      contactByPhone: formValue?.contactByPhone,
    };

    this.loading = true;

    this.subscription.add(
      this.etatCivilService
        .patchContactDetails(this.usager.ref, form)
        .subscribe({
          next: () => {
            this.editContactDetailsChange.emit(false);
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

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
