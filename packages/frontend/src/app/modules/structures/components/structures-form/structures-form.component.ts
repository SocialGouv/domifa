import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from "@khazii/ngx-intl-tel-input";

import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { Subject, Subscription, of } from "rxjs";
import { map, takeUntil } from "rxjs/operators";

import {
  FormEmailTakenValidator,
  PREFERRED_COUNTRIES,
} from "../../../../../_common/model";
import { StructureService } from "../../services/structure.service";
import { StructureCommonWeb } from "../../classes/StructureCommonWeb.class";

import { anyPhoneValidator } from "../../../shared/phone/mobilePhone.validator";
import { getFormPhone } from "../../../shared/phone";
import { EmailValidator } from "../../../../shared";
import {
  StructureCommon,
  Structure,
  STRUCTURE_ORGANISME_TYPE_LABELS,
  getDepartementFromCodePostal,
  DEPARTEMENTS_LISTE,
} from "@domifa/common";

import {
  getPostalCodeValidator,
  updateComplementAdress,
  isInvalidStructureName,
} from "../../utils/structure-validators";
import isEmail from "validator/lib/isEmail";

@Component({
  selector: "app-structures-form",
  styleUrls: ["./structures-form.component.css"],
  templateUrl: "./structures-form.component.html",
})
export class StructuresFormComponent implements OnInit, OnDestroy {
  public readonly PhoneNumberFormat = PhoneNumberFormat;
  public readonly SearchCountryField = SearchCountryField;
  public readonly CountryISO = CountryISO;
  public readonly PREFERRED_COUNTRIES: CountryISO[] = PREFERRED_COUNTRIES;
  public success = false;

  public loading = false;
  public structureForm!: UntypedFormGroup;
  public structure: StructureCommon;
  public readonly DEPARTEMENTS_LISTE = DEPARTEMENTS_LISTE;
  public readonly STRUCTURE_ORGANISME_TYPE_LABELS =
    STRUCTURE_ORGANISME_TYPE_LABELS;
  public submitted = false;

  public structureRegisterInfos: {
    etapeInscription: number;
    structure: StructureCommon;
  };
  public accountExist: boolean;

  private unsubscribe: Subject<void> = new Subject();
  private subscription = new Subscription();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly structureService: StructureService,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title
  ) {
    this.structure = new StructureCommonWeb();

    this.structureRegisterInfos = {
      etapeInscription: 0,
      structure: this.structure,
    };

    this.accountExist = false;
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.structureForm.controls;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Inscription d'une structure sur DomiFa");

    this.structureForm = this.formBuilder.group({
      codePostal: [this.structure.codePostal, getPostalCodeValidator(true)],
      adresse: [this.structure.adresse, [Validators.required]],
      adresseCourrier: this.formBuilder.group({
        actif: [this.structure.adresseCourrier.actif, []],
        adresse: [this.structure.adresseCourrier.adresse, []],
        ville: [this.structure.adresseCourrier.ville, []],
        codePostal: [this.structure.adresseCourrier.codePostal, []],
      }),
      agrement: [this.structure.agrement, []],
      capacite: [this.structure.capacite, []],
      complementAdresse: [this.structure.complementAdresse, []],
      departement: [this.structure.departement, []],
      email: [
        this.structure.email,
        [Validators.required, EmailValidator],
        this.validateEmailNotTaken.bind(this),
      ],
      nom: [this.structure.nom, [Validators.required]],
      telephone: new UntypedFormControl(undefined, [
        Validators.required,
        anyPhoneValidator,
      ]),
      responsable: this.formBuilder.group({
        fonction: [this.structure.responsable.fonction, [Validators.required]],
        nom: [this.structure.responsable.nom, [Validators.required]],
        prenom: [this.structure.responsable.prenom, [Validators.required]],
      }),
      structureType: [this.structure.structureType, [Validators.required]],
      organismeType: [this.structure.organismeType, []],
      ville: [this.structure.ville, [Validators.required]],
      readCgu: [null, [Validators.requiredTrue]],
      acceptCgu: [null, [Validators.requiredTrue]],
    });

    this.subscription.add(
      this.structureForm
        .get("structureType")
        ?.valueChanges.subscribe((value) => {
          this.structureForm.get("agrement")?.setValidators(null);
          this.structureForm.get("departement")?.setValidators(null);
          this.structureForm.get("organismeType")?.setValidators(null);

          if (value === "asso") {
            this.structureForm
              .get("agrement")
              ?.setValidators(Validators.required);
            this.structureForm
              .get("departement")
              ?.setValidators(Validators.required);
            this.structureForm
              .get("organismeType")
              ?.setValidators(Validators.required);
          }

          this.structureForm.get("agrement")?.updateValueAndValidity();
          this.structureForm.get("departement")?.updateValueAndValidity();
          this.structureForm.get("organismeType")?.updateValueAndValidity();
        })
    );

    this.subscription.add(
      this.structureForm
        .get("adresseCourrier")
        ?.get("actif")
        ?.valueChanges.subscribe((value: boolean) => {
          updateComplementAdress(this.structureForm, value);
        })
    );
  }

  public submitStrucutre(): void {
    this.submitted = true;

    if (this.structureForm.invalid) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
      return;
    }

    const departement = getDepartementFromCodePostal(
      this.structureForm.value.codePostal
    );

    const structureFormValue: Partial<Structure> = {
      ...this.structureForm.value,
      options: {
        numeroBoite: false,
        surnom: false,
      },
      departement,
      telephone: getFormPhone(this.structureForm.value.telephone),
    };

    this.subscription.add(
      this.structureService.prePost(structureFormValue).subscribe({
        next: (structure: StructureCommon) => {
          this.structureRegisterInfos.etapeInscription = 1;
          this.structureRegisterInfos.structure = structure;
          window.scroll({
            behavior: "smooth",
            left: 0,
            top: 0,
          });
        },
        error: () => {
          this.toastService.error("Veuillez vérifier les champs du formulaire");
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
