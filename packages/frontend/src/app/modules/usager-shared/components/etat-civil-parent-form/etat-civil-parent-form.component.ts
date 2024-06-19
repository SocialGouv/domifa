import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
} from "@angular/core";
import {
  UntypedFormGroup,
  AbstractControl,
  UntypedFormArray,
  Validators,
  UntypedFormControl,
  UntypedFormBuilder,
  ValidationErrors,
} from "@angular/forms";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { endOfDay } from "date-fns";
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from "@khazii/ngx-intl-tel-input";
import { Observable, Subscription } from "rxjs";

import {
  Telephone,
  PHONE_PLACEHOLDERS,
  UsagerEtatCivilFormData,
  UsagerFormAyantDroit,
} from "../../../../../_common/model";
import {
  PREFERRED_COUNTRIES,
  languagesAutocomplete,
  minDateToday,
  minDateNaissance,
  formatDateToNgb,
  NoWhiteSpaceValidator,
  parseDateFromNgb,
  EmailValidator,
} from "../../../../shared";

import { AyantDroit, UsagerFormModel } from "../../interfaces";
import {
  NgbDateCustomParserFormatter,
  CustomDatepickerI18n,
  AuthService,
} from "../../../shared/services";
import {
  getFormPhone,
  mobilePhoneValidator,
  setFormPhone,
} from "../../../shared/phone";
import {
  LIEN_PARENTE_LABELS,
  UsagerAyantDroit,
  UserStructure,
} from "@domifa/common";
import { COUNTRIES } from "@domifa/common";

@Component({
  selector: "app-etat-civil-parent-form",
  templateUrl: "./etat-civil-parent-form.component.html",
  providers: [
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
})
export class EtatCivilParentFormComponent implements OnDestroy {
  public PhoneNumberFormat = PhoneNumberFormat;
  public SearchCountryField = SearchCountryField;
  public CountryISO = CountryISO;
  public PREFERRED_COUNTRIES: CountryISO[] = PREFERRED_COUNTRIES;
  public countryCode: string | null;

  public readonly LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;

  /* Config datepickers */
  public maxDateNaissance: NgbDateStruct;
  public minDateNaissance: NgbDateStruct;
  public minDateToday: NgbDateStruct;
  public mobilePhonePlaceHolder: string;

  public usager!: UsagerFormModel;
  public usagerForm!: UntypedFormGroup;

  public submitted = false;
  public loading = false;
  public ayantsDroitsExist = false;
  public displayContactDetails = true;

  public languagesAutocomplete = languagesAutocomplete;
  public languagesAutocompleteSearch = languagesAutocomplete.typeahead({
    maxResults: 10,
  });

  public subscription = new Subscription();

  public currentUserSubject$: Observable<UserStructure | null>;

  @ViewChildren("adName")
  public firstInputs!: QueryList<ElementRef>;

  public get f(): { [key: string]: AbstractControl } {
    return this.usagerForm.controls;
  }

  public get ayantsDroits(): UntypedFormArray {
    return this.usagerForm.get("ayantsDroits") as UntypedFormArray;
  }

  constructor(
    protected readonly formBuilder: UntypedFormBuilder,
    protected readonly authService: AuthService,
    protected readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.submitted = false;
    this.loading = false;
    this.mobilePhonePlaceHolder = "";
    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());

    this.currentUserSubject$ = this.authService.currentUserSubject;
  }

  public initForm(): void {
    this.ayantsDroitsExist = this.usager.ayantsDroits?.length > 0;

    this.usagerForm = this.formBuilder.group({
      ayantsDroits: this.formBuilder.array([]),
      langue: [this.usager.langue, languagesAutocomplete.validator],
      ayantsDroitsExist: [this.ayantsDroitsExist, []],
      dateNaissance: [
        this.usager.dateNaissance
          ? formatDateToNgb(this.usager.dateNaissance)
          : null,
        [Validators.required],
      ],
      customRef: [this.usager.customRef, [Validators.maxLength(50)]],
      nationalite: [this.usager.nationalite, [this.countryValidator]],
      email: [this.usager.email, [EmailValidator]],
      nom: [
        this.usager.nom,
        [Validators.required, NoWhiteSpaceValidator, Validators.maxLength(200)],
      ],
      numeroDistribution: [
        this.usager.numeroDistribution,
        [Validators.maxLength(50)],
      ],
      contactByPhone: [this.usager.contactByPhone, [Validators.required]],
      telephone: new UntypedFormControl(
        setFormPhone(this.usager.telephone),
        this.usager.contactByPhone
          ? [Validators.required, mobilePhoneValidator]
          : [mobilePhoneValidator]
      ),
      prenom: [
        this.usager.prenom,
        [Validators.required, NoWhiteSpaceValidator, Validators.maxLength(200)],
      ],
      sexe: [this.usager.sexe, Validators.required],
      surnom: [this.usager.surnom, [Validators.maxLength(100)]],
      villeNaissance: [
        this.usager.villeNaissance,
        [Validators.required, NoWhiteSpaceValidator, Validators.maxLength(100)],
      ],
    });

    // Ajout des ayant-droit
    for (const ayantDroit of this.usager.ayantsDroits) {
      (this.usagerForm.controls.ayantsDroits as UntypedFormArray).push(
        this.newAyantDroit(ayantDroit)
      );
    }

    this.subscription.add(
      this.usagerForm
        .get("contactByPhone")
        ?.valueChanges.subscribe((value: boolean) => {
          const isRequiredTelephone = value
            ? [Validators.required, mobilePhoneValidator]
            : [mobilePhoneValidator];

          this.usagerForm.get("telephone")?.setValidators(isRequiredTelephone);
          this.usagerForm.get("telephone")?.updateValueAndValidity();
        })
    );

    this.updatePlaceHolder(this.usagerForm.value?.telephone?.countryCode);
  }

  // Gestion des ayant-droits
  public addAyantDroit(ayantDroit: AyantDroit = new AyantDroit()): void {
    (this.usagerForm.controls.ayantsDroits as UntypedFormArray).push(
      this.newAyantDroit(ayantDroit)
    );
    this.changeFocus(this.ayantsDroits.controls.length - 1);
  }

  public deleteAyantDroit(i: number): void {
    (this.usagerForm.controls.ayantsDroits as UntypedFormArray).removeAt(i);
    const formAyantDroit = this.usagerForm.controls
      .ayantsDroits as UntypedFormArray;
    if (formAyantDroit.length === 0) {
      this.usagerForm.controls.ayantsDroitsExist.setValue(false);
    } else {
      i === 0 ? this.changeFocus(0) : this.changeFocus(i - 1);
    }
  }

  public resetAyantDroit(): void {
    while (
      (this.usagerForm.controls.ayantsDroits as UntypedFormArray).length !== 0
    ) {
      (this.usagerForm.controls.ayantsDroits as UntypedFormArray).removeAt(0);
    }
  }

  public newAyantDroit(ayantDroit: AyantDroit) {
    return this.formBuilder.group({
      dateNaissance: [
        ayantDroit.dateNaissance
          ? formatDateToNgb(ayantDroit.dateNaissance)
          : null,
        [Validators.required],
      ],
      lien: [ayantDroit.lien, Validators.required],
      nom: [ayantDroit.nom, Validators.required],
      prenom: [ayantDroit.prenom, Validators.required],
    });
  }

  public updatePlaceHolder(country: string): void {
    if (!country) {
      country =
        this.usagerForm.value?.telephone?.countryCode ||
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getEtatCivilForm(formValue: any): UsagerEtatCivilFormData {
    const ayantsDroits: UsagerAyantDroit[] = formValue.ayantsDroits.map(
      (ayantDroit: UsagerFormAyantDroit) => {
        return {
          lien: ayantDroit.lien,
          nom: ayantDroit.nom.trim(),
          prenom: ayantDroit.prenom.trim(),
          dateNaissance: endOfDay(parseDateFromNgb(ayantDroit.dateNaissance)),
        };
      }
    );

    const telephone: Telephone =
      this.displayContactDetails && formValue?.telephone
        ? getFormPhone(formValue.telephone)
        : this.usager.telephone;

    const data: UsagerEtatCivilFormData = {
      sexe: formValue?.sexe,
      nom: formValue?.nom.trim(),
      prenom: formValue?.prenom.trim(),
      surnom: formValue?.surnom || null,
      nationalite: formValue?.nationalite || null,
      villeNaissance: formValue?.villeNaissance,
      langue: formValue?.langue || null,
      customRef: formValue?.customRef || null,
      email: formValue?.email.toLowerCase().trim() || null,
      telephone,
      numeroDistribution: formValue?.numeroDistribution || null,
      ayantsDroits,
      contactByPhone: formValue?.contactByPhone,
      dateNaissance: endOfDay(parseDateFromNgb(formValue.dateNaissance)),
    };

    return data;
  }

  public changeFocus(index: number) {
    this.changeDetectorRef.detectChanges();
    const elementToFocus = this.firstInputs.toArray()[index]?.nativeElement;
    if (elementToFocus) {
      elementToFocus.focus();
    }
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public countryValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    if (!control?.value) {
      return null;
    }
    const value = control?.value.toString().trim();
    const isWhitespace = value.length === 0;
    const isValid = !isWhitespace;

    return value && isValid && Object.values(COUNTRIES).includes(value)
      ? null
      : { wrongCountry: true };
  };
}
