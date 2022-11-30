import { FormEmailTakenValidator } from "./../../../../../_common/model/_general/FormEmailTakenValidator.type";
import { COUNTRY_CODES_TIMEZONE } from "./../../../../../_common/model/telephone/COUNTRY_CODES";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";

import { of, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from "ngx-intl-tel-input";

import { Structure, StructureCommon } from "../../../../../_common/model";

import {
  PREFERRED_COUNTRIES,
  DEPARTEMENTS_LISTE,
  regexp,
} from "../../../../shared";
import {
  setFormPhone,
  getFormPhone,
  anyPhoneValidator,
} from "../../../shared/phone";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { structureNameChecker, StructureService } from "../../services";

@Component({
  selector: "app-structure-edit-form",
  templateUrl: "./structure-edit-form.component.html",
  styleUrls: ["./structure-edit-form.component.css"],
})
export class StructureEditFormComponent implements OnInit, OnDestroy {
  public readonly PhoneNumberFormat = PhoneNumberFormat;
  public readonly SearchCountryField = SearchCountryField;
  public readonly CountryISO = CountryISO;
  public readonly PREFERRED_COUNTRIES: CountryISO[] = PREFERRED_COUNTRIES;
  public readonly DEPARTEMENTS_LISTE = DEPARTEMENTS_LISTE;

  public loading = false;
  public submitted = false;
  public structureForm: FormGroup;
  public selectedCountryISO: CountryISO = CountryISO.France;

  @Input() public structure!: StructureCommon;

  private subscription = new Subscription();

  constructor(
    private readonly structureService: StructureService,
    private readonly formBuilder: FormBuilder,
    private readonly toastService: CustomToastService
  ) {
    this.structureForm = new FormGroup({});
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.structureForm.controls;
  }

  public ngOnInit(): void {
    const adresseRequired =
      this.structure.adresseCourrier.actif === true
        ? [Validators.required]
        : null;

    const assoRequired =
      this.structure.structureType === "asso" ? [Validators.required] : null;

    this.structureForm = this.formBuilder.group({
      structureType: [this.structure.structureType, [Validators.required]],
      adresse: [this.structure.adresse, [Validators.required]],
      agrement: [this.structure.agrement, assoRequired],
      capacite: [this.structure.capacite, []],
      codePostal: [
        this.structure.codePostal,
        [
          Validators.maxLength(5),
          this.structureService.codePostalValidator(),
          Validators.required,
        ],
      ],
      complementAdresse: [this.structure.complementAdresse, []],
      departement: [this.structure.departement, assoRequired],
      email: [
        this.structure.email,
        [Validators.required, Validators.pattern(regexp.email)],
      ],
      nom: [this.structure.nom, [Validators.required]],
      options: this.formBuilder.group({
        numeroBoite: [this.structure.options.numeroBoite, []],
      }),
      adresseCourrier: this.formBuilder.group({
        actif: [this.structure.adresseCourrier.actif, []],
        adresse: [this.structure.adresseCourrier.adresse, adresseRequired],
        ville: [this.structure.adresseCourrier.ville, adresseRequired],
        codePostal: [
          this.structure.adresseCourrier.codePostal,
          adresseRequired,
        ],
      }),
      telephone: new FormControl(setFormPhone(this.structure.telephone), [
        Validators.required,
        anyPhoneValidator,
      ]),
      responsable: this.formBuilder.group({
        fonction: [this.structure.responsable.fonction, [Validators.required]],
        nom: [this.structure.responsable.nom, [Validators.required]],
        prenom: [this.structure.responsable.prenom, [Validators.required]],
      }),

      ville: [this.structure.ville, [Validators.required]],
    });

    this.selectedCountryISO = COUNTRY_CODES_TIMEZONE[this.structure.timeZone];

    this.subscription.add(
      this.structureForm
        .get("adresseCourrier")
        ?.get("actif")
        ?.valueChanges.subscribe((value: boolean) => {
          const isRequired = value === true ? [Validators.required] : null;

          this.structureForm
            .get("adresseCourrier")
            ?.get("adresse")
            ?.setValidators(isRequired);
          this.structureForm
            .get("adresseCourrier")
            ?.get("codePostal")
            ?.setValidators(isRequired);
          this.structureForm
            .get("adresseCourrier")
            ?.get("ville")
            ?.setValidators(isRequired);

          this.structureForm
            .get("adresseCourrier")
            ?.get("adresse")
            ?.updateValueAndValidity();
          this.structureForm
            .get("adresseCourrier")
            ?.get("codePostal")
            ?.updateValueAndValidity();
          this.structureForm
            .get("adresseCourrier")
            ?.get("ville")
            ?.updateValueAndValidity();
        })
    );
  }

  public submitStrucutre() {
    this.submitted = true;
    if (this.structureForm.invalid) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
      return;
    }

    this.loading = true;

    const structureFormValue: Structure = {
      ...this.structureForm.value,
    };

    structureFormValue.telephone = getFormPhone(
      this.structureForm.value.telephone
    );

    this.subscription.add(
      this.structureService.patch(structureFormValue).subscribe({
        next: (structure: StructureCommon) => {
          this.toastService.success(
            "Les modifications ont bien été prises en compte"
          );
          this.structure = structure;
          this.loading = false;
        },
        error: () => {
          this.toastService.error("Une erreur est survenue");
          this.loading = false;
        },
      })
    );
  }

  public validateEmailNotTaken(
    control: AbstractControl
  ): FormEmailTakenValidator {
    const testEmail = RegExp(regexp.email).test(control.value);
    return testEmail
      ? this.structureService.validateEmail(control.value).pipe(
          map((res: boolean) => {
            return res === false ? null : { emailTaken: true };
          })
        )
      : of(null);
  }

  public isInvalidStructureName(structureName: string): boolean {
    return structureNameChecker.isInvalidStructureName(structureName);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
