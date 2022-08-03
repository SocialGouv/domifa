import {
  Component,
  ElementRef,
  OnInit,
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
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
  ChangeData,
} from "ngx-intl-tel-input";
import { Observable } from "rxjs";

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
  anyPhoneValidator,
  getFormPhone,
  isNumber,
  padNumber,
} from "../../../../shared";
import { AuthService } from "../../../shared/services/auth.service";

import { AyantDroit, UsagerFormModel } from "../../interfaces";

@Component({
  selector: "app-etat-civil-parent-form",
  templateUrl: "./etat-civil-parent-form.component.html",
  styleUrls: ["./etat-civil-parent-form.component.css"],
})
export class EtatCivilParentFormComponent implements OnInit {
  public PhoneNumberFormat = PhoneNumberFormat;
  public SearchCountryField = SearchCountryField;
  public CountryISO = CountryISO;
  public PREFERRED_COUNTRIES: CountryISO[] = PREFERRED_COUNTRIES;

  public LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;

  /* Config datepickers */
  public dToday = new Date();
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

  public currentUserSubject$: Observable<UserStructure>;

  @ViewChildren("adNom") public inputsAyantDroit!: QueryList<ElementRef>;

  get f(): { [key: string]: AbstractControl } {
    return this.usagerForm.controls;
  }

  get ayantsDroits(): FormArray {
    return this.usagerForm.get("ayantsDroits") as FormArray;
  }

  constructor(
    public formBuilder: FormBuilder,
    public authService: AuthService
  ) {
    this.submitted = false;
    this.loading = false;
    this.mobilePhonePlaceHolder = "";
    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());
    this.currentUserSubject$ = this.authService.currentUserSubject;
  }

  ngOnInit(): void {}

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
          : [anyPhoneValidator]
      ),
      prenom: [this.usager.prenom, [Validators.required, noWhiteSpace]],
      sexe: [this.usager.sexe, Validators.required],
      surnom: [this.usager.surnom, []],
      villeNaissance: [this.usager.villeNaissance, [Validators.required]],
    });

    console.log(this.usagerForm.value.telephone);
    for (const ayantDroit of this.usager.ayantsDroits) {
      this.addAyantDroit(ayantDroit);
    }

    this.usagerForm
      .get("contactByPhone")
      .valueChanges.subscribe((value: boolean) => {
        const isRequiredTelephone = value
          ? [Validators.required, mobilePhoneValidator]
          : [anyPhoneValidator];

        console.log(value);
        console.log(this.usagerForm.value);

        this.mobilePhonePlaceHolder = "";
        const prefValue = this.usagerForm.value.telephone as ChangeData;
        console.log(prefValue);
        this.updatePlaceHolder(prefValue.countryCode);

        this.usagerForm.get("telephone").setValidators(isRequiredTelephone);
        this.usagerForm.get("telephone").updateValueAndValidity();
      });
  }

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

  public updatePlaceHolder(country: string) {
    console.log("updatePlaceHolder");
    console.log(country);
    if (typeof PHONE_PLACEHOLDERS[country] !== "undefined") {
      this.mobilePhonePlaceHolder = PHONE_PLACEHOLDERS[country.toLowerCase()];
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
          nom: ayantDroit.nom,
          prenom: ayantDroit.prenom,
          dateNaissance: new Date(this.formatEn(ayantDroit.dateNaissance)),
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
      nom: formValue?.nom,
      prenom: formValue?.prenom,
      surnom: formValue?.surnom,
      villeNaissance: formValue?.villeNaissance,
      langue: formValue?.langue,
      customRef: formValue?.customRef,
      email: formValue?.email,
      telephone,
      ayantsDroits,
      contactByPhone: false,
      dateNaissance: new Date(this.formatEn(formValue.dateNaissance)),
    };

    return datas;
  }

  public formatEn(date: NgbDateStruct): string {
    return date === null
      ? null
      : `${date.year}-${isNumber(date.month) ? padNumber(date.month) : ""}-${
          isNumber(date.day) ? padNumber(date.day) : ""
        }`;
  }
}
