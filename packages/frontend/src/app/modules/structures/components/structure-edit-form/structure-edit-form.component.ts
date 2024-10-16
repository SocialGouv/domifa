import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";

import { Subject, Subscription, of } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from "@khazii/ngx-intl-tel-input";
import { NoWhiteSpaceValidator, EmailValidator } from "../../../../shared";
import {
  setFormPhone,
  anyPhoneValidator,
  getFormPhone,
} from "../../../shared/phone";
import { CustomToastService } from "../../../shared/services";
import { StructureService } from "../../services";

import {
  getPostalCodeValidator,
  updateComplementAdress,
  isInvalidStructureName,
} from "../../utils/structure-validators";
import isEmail from "validator/lib/isEmail";
import {
  StructureCommon,
  Structure,
  STRUCTURE_ORGANISME_TYPE_LABELS,
  DEPARTEMENTS_LISTE,
  COUNTRY_CODES_TIMEZONE,
} from "@domifa/common";
import {
  FormEmailTakenValidator,
  PREFERRED_COUNTRIES,
} from "../../../../../_common/model";

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
  public readonly STRUCTURE_ORGANISME_TYPE_LABELS =
    STRUCTURE_ORGANISME_TYPE_LABELS;
  public readonly DEPARTEMENTS_LISTE = DEPARTEMENTS_LISTE;

  public loading = false;
  public submitted = false;
  public structureForm: UntypedFormGroup;
  public selectedCountryISO: CountryISO = CountryISO.France;

  @Input() public structure!: StructureCommon;

  private readonly subscription = new Subscription();
  private readonly unsubscribe: Subject<void> = new Subject();

  constructor(
    private readonly structureService: StructureService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastService: CustomToastService
  ) {
    this.structureForm = new UntypedFormGroup({});
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
      codePostal: [this.structure.codePostal, getPostalCodeValidator(true)],
      complementAdresse: [this.structure.complementAdresse, []],
      departement: [this.structure.departement, assoRequired],
      email: [this.structure.email, [Validators.required, EmailValidator]],
      nom: [this.structure.nom, [Validators.required]],
      options: this.formBuilder.group({
        numeroBoite: [this.structure.options.numeroBoite ?? false, []],
        surnom: [this.structure.options.surnom ?? false, []],
      }),
      adresseCourrier: this.formBuilder.group({
        actif: [this.structure.adresseCourrier.actif, []],
        adresse: [this.structure.adresseCourrier.adresse, adresseRequired],
        ville: [this.structure.adresseCourrier.ville, adresseRequired],
        codePostal: [
          this.structure.adresseCourrier.codePostal,
          getPostalCodeValidator(this.structure.adresseCourrier.actif),
        ],
      }),
      telephone: new UntypedFormControl(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setFormPhone(this.structure.telephone as any),
        [Validators.required, anyPhoneValidator]
      ),
      responsable: this.formBuilder.group({
        fonction: [
          this.structure.responsable.fonction,
          [Validators.required, NoWhiteSpaceValidator],
        ],
        nom: [
          this.structure.responsable.nom,
          [Validators.required, NoWhiteSpaceValidator],
        ],
        prenom: [
          this.structure.responsable.prenom,
          [Validators.required, NoWhiteSpaceValidator],
        ],
      }),
      ville: [this.structure.ville, [Validators.required]],
      organismeType: [this.structure.organismeType, assoRequired],
    });

    this.selectedCountryISO = COUNTRY_CODES_TIMEZONE[
      this.structure.timeZone
    ] as CountryISO;
    this.subscription.add(
      this.structureForm
        .get("adresseCourrier")
        ?.get("actif")
        ?.valueChanges.subscribe((value: boolean) => {
          updateComplementAdress(this.structureForm, value);
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
    return isEmail(control.value)
      ? this.structureService.validateEmail(control.value).pipe(
          takeUntil(this.unsubscribe),
          map((res: boolean) => {
            return res === false ? null : { emailTaken: true };
          })
        )
      : of(null);
  }

  public isInvalidStructureName(structureName: string): boolean {
    return isInvalidStructureName(structureName);
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.subscription.unsubscribe();
  }
}
