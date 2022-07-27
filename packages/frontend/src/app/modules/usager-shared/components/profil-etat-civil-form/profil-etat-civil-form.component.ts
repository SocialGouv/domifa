import { UserStructure } from "./../../../../../_common/model/user-structure/UserStructure.type";
import { UsagerEtatCivilFormData } from "./../../../../../_common/model/usager/form/UsagerEtatCivilFormData.type";
import { LIEN_PARENTE_LABELS } from "./../../../../../_common/model/usager/_constants/LIEN_PARENTE_LABELS.const";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";

import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from "ngx-intl-tel-input";

import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { UsagerLight } from "../../../../../_common/model";
import {
  languagesAutocomplete,
  noWhiteSpace,
  setFormPhone,
} from "../../../../shared";
import {
  minDateNaissance,
  formatDateToNgb,
  minDateToday,
} from "../../../../shared/bootstrap-util";
import { PREFERRED_COUNTRIES } from "../../../../shared/constants";

import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter";
import { CustomDatepickerI18n } from "../../../shared/services/date-french";
import { UsagerFormModel, AyantDroit } from "../../interfaces";
import { EtatCivilService } from "../../services/etat-civil.service";
import { getEtatCivilForm } from "../../utils";

@Component({
  selector: "app-profil-etat-civil-form",
  templateUrl: "./profil-etat-civil-form.component.html",
  styleUrls: ["./profil-etat-civil-form.component.css"],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
})
export class ProfilEtatCivilFormComponent implements OnInit {
  public PhoneNumberFormat = PhoneNumberFormat;
  public SearchCountryField = SearchCountryField;
  public CountryISO = CountryISO;
  public PREFERRED_COUNTRIES: CountryISO[] = PREFERRED_COUNTRIES;

  @Input() public usager: UsagerFormModel;
  @Output() public usagerChange = new EventEmitter<UsagerFormModel>();
  @Input() public me!: UserStructure;

  public usagerForm!: FormGroup;
  public loading: boolean;
  public submitted: boolean;

  public languagesAutocomplete = languagesAutocomplete;

  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;
  public selectedCountryISO = CountryISO.France;
  public LIENS_PARENTE = LIEN_PARENTE_LABELS;

  public languagesAutocompleteSearch = languagesAutocomplete.typeahead({
    maxResults: 10,
  });

  @Output() public editInfosChange = new EventEmitter<boolean>();

  get f(): { [key: string]: AbstractControl } {
    return this.usagerForm.controls;
  }

  get ayantsDroits(): FormArray {
    return this.usagerForm.get("ayantsDroits") as FormArray;
  }

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly toastService: CustomToastService,
    private readonly etatCivilService: EtatCivilService
  ) {
    this.submitted = false;
    this.loading = false;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = minDateToday;
    this.usager = new UsagerFormModel();
  }

  public ngOnInit(): void {
    this.initForms();
  }

  public initForms() {
    this.usagerForm = this.formBuilder.group({
      ayantsDroits: this.formBuilder.array([]),
      ayantsDroitsExist: [this.usager.ayantsDroitsExist, []],
      customRef: [this.usager.customRef, []],
      dateNaissance: [
        formatDateToNgb(this.usager.dateNaissance),
        [Validators.required],
      ],
      email: [this.usager.email, [Validators.email]],
      ref: [this.usager.ref, [Validators.required]],
      langue: [this.usager.langue, languagesAutocomplete.validator("langue")],
      nom: [this.usager.nom, [Validators.required, noWhiteSpace]],
      telephone: new FormControl(setFormPhone(this.usager.telephone), null),
      prenom: [this.usager.prenom, [Validators.required, noWhiteSpace]],
      sexe: [this.usager.sexe, Validators.required],
      surnom: [this.usager.surnom, []],
      villeNaissance: [
        this.usager.villeNaissance,
        [Validators.required, noWhiteSpace],
      ],
    });

    for (const ayantDroit of this.usager.ayantsDroits) {
      this.addAyantDroit(ayantDroit);
    }

    this.selectedCountryISO =
      this.usager.telephone.numero !== "" &&
      this.usager.telephone.numero !== null
        ? (this.usager.telephone.countryCode as CountryISO)
        : (this.me.structure.telephone.countryCode as CountryISO);
  }

  public addAyantDroit(ayantDroit: AyantDroit = new AyantDroit()): void {
    (this.usagerForm.controls.ayantsDroits as FormArray).push(
      this.newAyantDroit(ayantDroit)
    );
  }

  public deleteAyantDroit(i: number): void {
    if (i === 0) {
      this.usagerForm.controls.ayantsDroitsExist.setValue(false);
    }

    (this.usagerForm.controls.ayantsDroits as FormArray).removeAt(i);
  }

  public newAyantDroit(ayantDroit: AyantDroit): FormGroup {
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

  public updateInfos(): void {
    this.submitted = true;

    if (this.usagerForm.invalid) {
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      return;
    }
    this.loading = true;

    const formValue: UsagerEtatCivilFormData = getEtatCivilForm(
      this.usagerForm.value
    );

    formValue.preference = this.usager.preference;

    this.etatCivilService.patchEtatCivil(this.usager.ref, formValue).subscribe({
      next: (usager: UsagerLight) => {
        this.editInfosChange.emit(false);
        this.toastService.success("Enregistrement réussi");
        this.usagerChange.emit(new UsagerFormModel(usager));
        this.submitted = false;
        this.loading = false;
      },
      error: () => {
        this.loading = false;

        this.toastService.error("Veuillez vérifier les champs du formulaire");
      },
    });
  }
}
