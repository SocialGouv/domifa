import {
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
} from "@angular/core";
import {
  FormGroup,
  AbstractControl,
  FormArray,
  Validators,
  FormControl,
  FormBuilder,
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
} from "ngx-intl-tel-input";
import { Observable, Subscription } from "rxjs";

import {
  LIEN_PARENTE_LABELS,
  Telephone,
  PHONE_PLACEHOLDERS,
  UsagerAyantDroit,
  UsagerEtatCivilFormData,
  UsagerFormAyantDroit,
  UserStructure,
} from "../../../../../_common/model";
import {
  PREFERRED_COUNTRIES,
  languagesAutocomplete,
  minDateToday,
  minDateNaissance,
  formatDateToNgb,
  noWhiteSpace,
  setFormPhone,
  mobilePhoneValidator,
  getFormPhone,
  parseDateFromNgb,
} from "../../../../shared";
import { AuthService } from "../../../shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter";
import { CustomDatepickerI18n } from "../../../shared/services/date-french";

import { AyantDroit, UsagerFormModel } from "../../interfaces";

@Component({
  selector: "app-etat-civil-parent-form",
  templateUrl: "./etat-civil-parent-form.component.html",
  providers: [
    NgbDateCustomParserFormatter,
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

  public LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;

  /* Config datepickers */
  public maxDateNaissance: NgbDateStruct;
  public minDateNaissance: NgbDateStruct;
  public minDateToday: NgbDateStruct;
  public mobilePhonePlaceHolder: string;

  public usager!: UsagerFormModel;
  public usagerForm!: FormGroup;

  public submitted = false;
  public loading = false;

  public languagesAutocomplete = languagesAutocomplete;

  public languagesAutocompleteSearch = languagesAutocomplete.typeahead({
    maxResults: 10,
  });

  private subscription = new Subscription();

  public currentUserSubject$: Observable<UserStructure>;

  get f(): { [key: string]: AbstractControl } {
    return this.usagerForm.controls;
  }

  get ayantsDroits(): FormArray {
    return this.usagerForm.get("ayantsDroits") as FormArray;
  }

  @ViewChildren("adNom") public inputsAyantDroit!: QueryList<ElementRef>;

  constructor(
    public formBuilder: FormBuilder,
    public authService: AuthService
  ) {
    this.countryCode = null;
    this.submitted = false;
    this.loading = false;
    this.mobilePhonePlaceHolder = "";
    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());
    this.currentUserSubject$ = this.authService.currentUserSubject;
  }

  public initForm(): void {
    this.usagerForm = this.formBuilder.group({
      ayantsDroits: this.formBuilder.array([]),
      langue: [this.usager.langue, languagesAutocomplete.validator("langue")],
      ayantsDroitsExist: [this.usager.ayantsDroitsExist, []],
      dateNaissance: [
        formatDateToNgb(this.usager.dateNaissance),
        [Validators.required],
      ],
      customRef: [this.usager.customRef, []],
      email: [this.usager.email, [Validators.email]],
      nom: [this.usager.nom, [Validators.required, noWhiteSpace]],
      contactByPhone: [this.usager.contactByPhone, [Validators.required]],
      telephone: new FormControl(
        setFormPhone(this.usager.telephone),
        this.usager.contactByPhone
          ? [Validators.required, mobilePhoneValidator]
          : [mobilePhoneValidator]
      ),
      prenom: [this.usager.prenom, [Validators.required, noWhiteSpace]],
      sexe: [this.usager.sexe, Validators.required],
      surnom: [this.usager.surnom],
      villeNaissance: [
        this.usager.villeNaissance,
        [Validators.required, noWhiteSpace],
      ],
    });

    // Ajout des ayant-droit
    for (const ayantDroit of this.usager.ayantsDroits) {
      this.addAyantDroit(ayantDroit);
    }

    this.subscription.add(
      this.usagerForm
        .get("contactByPhone")
        ?.valueChanges.subscribe((value: boolean) => {
          const isRequiredTelephone = value
            ? [Validators.required, mobilePhoneValidator]
            : [mobilePhoneValidator];

          this.usagerForm.get("telephone").setValidators(isRequiredTelephone);
          this.usagerForm.get("telephone").updateValueAndValidity();
        })
    );

    this.updatePlaceHolder();
  }

  //
  // Gestion des ayant-droits
  public addAyantDroit(ayantDroit: AyantDroit = new AyantDroit()): void {
    (this.usagerForm.controls.ayantsDroits as FormArray).push(
      this.newAyantDroit(ayantDroit)
    );
    this.focusAyantDroit();
  }

  public deleteAyantDroit(i: number): void {
    (this.usagerForm.controls.ayantsDroits as FormArray).removeAt(i);
    const formAyantDroit = this.usagerForm.controls.ayantsDroits as FormArray;
    if (formAyantDroit.length === 0) {
      this.usagerForm.controls.ayantsDroitsExist.setValue(false);
    } else {
      this.focusAyantDroit();
    }
  }

  public resetAyantDroit(): void {
    while ((this.usagerForm.controls.ayantsDroits as FormArray).length !== 0) {
      (this.usagerForm.controls.ayantsDroits as FormArray).removeAt(0);
    }
  }

  private focusAyantDroit(): void {
    // Focus sur l'élément créé
    setTimeout(() => {
      const ayantDroitTable = this.usagerForm.controls.ayantsDroits.value;
      const inputs = this.inputsAyantDroit.toArray();
      inputs[ayantDroitTable.length - 1].nativeElement.focus();
    }, 500);
  }

  public newAyantDroit(ayantDroit: AyantDroit) {
    return this.formBuilder.group({
      dateNaissance: [
        formatDateToNgb(ayantDroit.dateNaissance),
        [Validators.required],
      ],
      lien: [ayantDroit.lien, Validators.required],
      nom: [ayantDroit.nom, Validators.required],
      prenom: [ayantDroit.prenom, Validators.required],
    });
  }

  //
  // Gestion des téléphones
  public updatePlaceHolder(country?: string) {
    if (!country && !this.countryCode) {
      country =
        this.usagerForm.value?.telephone?.countryCode ||
        this.usager.telephone.countryCode;
    }

    this.countryCode = country.toLowerCase();
    if (typeof PHONE_PLACEHOLDERS[this.countryCode] !== "undefined") {
      this.mobilePhonePlaceHolder =
        PHONE_PLACEHOLDERS[this.countryCode.toLowerCase()];
    } else {
      this.mobilePhonePlaceHolder = "";
    }
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

    const telephone: Telephone = !formValue?.telephone
      ? {
          countryCode: CountryISO.France,
          numero: "",
        }
      : getFormPhone(formValue.telephone);

    const datas: UsagerEtatCivilFormData = {
      sexe: formValue?.sexe,
      nom: formValue?.nom.trim(),
      prenom: formValue?.prenom.trim(),
      surnom: formValue?.surnom || null,
      villeNaissance: formValue?.villeNaissance,
      langue: formValue?.langue || null,
      customRef: formValue?.customRef || null,
      email: formValue?.email.toLowerCase().trim() || null,
      telephone,
      ayantsDroits,
      contactByPhone: formValue?.contactByPhone,
      dateNaissance: endOfDay(parseDateFromNgb(formValue.dateNaissance)),
    };

    return datas;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
