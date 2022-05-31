import { LIEN_PARENTE_LABELS } from "./../../../../../_common/model/usager/_constants/LIEN_PARENTE_LABELS.const";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
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
import {
  UsagerAyantDroit,
  UsagerFormAyantDroit,
  UsagerLight,
} from "../../../../../_common/model";
import { languagesAutocomplete } from "../../../../shared";
import {
  minDateNaissance,
  formatDateToNgb,
} from "../../../../shared/bootstrap-util";
import { PREFERRED_COUNTRIES } from "../../../../shared/constants";
import { regexp } from "../../../../shared/validators";
import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter";
import { CustomDatepickerI18n } from "../../../shared/services/date-french";
import { UsagerFormModel, AyantDroit } from "../../interfaces";
import { EtatCivilService } from "../../services/etat-civil.service";

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
  public preferredCountries: CountryISO[] = PREFERRED_COUNTRIES;

  @Input() public usager: UsagerFormModel;
  @Output() public usagerChanges = new EventEmitter<UsagerLight>();
  public usagerForm!: FormGroup;
  public loading: boolean;
  public submitted: boolean;

  public languagesAutocomplete = languagesAutocomplete;

  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

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
    private formBuilder: FormBuilder,
    private nbgDate: NgbDateCustomParserFormatter,
    private toastService: CustomToastService,
    private etatCivilService: EtatCivilService
  ) {
    this.submitted = false;
    this.loading = false;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());
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
      nom: [this.usager.nom, Validators.required],
      phone: [this.usager.phone, [Validators.pattern(regexp.phone)]],
      telephone: this.formBuilder.control(
        {
          number: this.usager.telephone.numero,
          countryCode: this.usager.telephone.indicatif,
        },
        []
      ),
      prenom: [this.usager.prenom, Validators.required],
      sexe: [this.usager.sexe, Validators.required],
      surnom: [this.usager.surnom, []],
      villeNaissance: [this.usager.villeNaissance, [Validators.required]],
    });

    for (const ayantDroit of this.usager.ayantsDroits) {
      this.addAyantDroit(ayantDroit);
    }
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

  public updateInfos() {
    this.submitted = true;

    if (this.usagerForm.invalid) {
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
    } else {
      this.loading = true;

      const usagerFormValues = this.usagerForm.value;

      const ayantsDroits: UsagerAyantDroit[] =
        usagerFormValues.ayantsDroits.map(
          (ayantDroit: UsagerFormAyantDroit) => {
            return {
              lien: ayantDroit.lien,
              nom: ayantDroit.nom,
              prenom: ayantDroit.prenom,
              dateNaissance: new Date(
                this.nbgDate.formatEn(ayantDroit.dateNaissance)
              ),
            };
          }
        );

      const formValue: UsagerFormModel = {
        ...usagerFormValues,
        ayantsDroits,
        dateNaissance: this.nbgDate.formatEn(
          this.usagerForm.controls.dateNaissance.value
        ),
        etapeDemande: this.usager.etapeDemande,
      };

      const telephone =
        this.usagerForm.value.telephone === null
          ? {
              indicatif: "fr",
              numero: "",
            }
          : {
              indicatif: this.usagerForm.value.telephone.countryCode,
              numero: this.usagerForm.value.telephone.number,
            };

      this.etatCivilService
        .patchEtatCivil({ ...formValue, telephone })
        .subscribe({
          next: (usager: UsagerLight) => {
            this.editInfosChange.emit(false);
            this.toastService.success("Enregistrement réussi");

            this.usagerChanges.emit(usager);
            this.submitted = false;
            this.loading = false;
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
