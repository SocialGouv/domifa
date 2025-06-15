import {
  FormBuilder,
  AbstractControl,
  ValidationErrors,
  FormGroup,
  Validators,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import { CurrentTool, MarketTool, StructureCommon } from "@domifa/common";
import { Observable, of, Subscription } from "rxjs";

import { setFormPhone, anyPhoneValidator } from "../../../shared/phone";
import {
  getPostalCodeValidator,
  siretValidator,
  updateComplementAdress,
  updateCurrentToolQuestion,
  updateMarketToolQuestion,
} from "./structure-validators";
import { NoWhiteSpaceValidator } from "../../../shared";

enum FormContext {
  CREATION = "creation",
  EDITION = "edition",
}

export function createform(
  structure: StructureCommon,
  formBuilder: FormBuilder,
  context: FormContext,
  validateEmailNotTaken: (
    control: AbstractControl
  ) => Observable<ValidationErrors | null>
): UntypedFormGroup {
  const addressIsRequired = structure.adresseCourrier?.actif === true;

  const isCreation = context === FormContext.CREATION;
  const isEdition = context === FormContext.EDITION;

  const emailAsyncValidators = validateEmailNotTaken
    ? [
        (control: AbstractControl) => {
          if (isEdition && control.value === structure.email) {
            return of(null);
          }
          return validateEmailNotTaken(control);
        },
      ]
    : null;

  const baseForm = {
    codePostal: [structure.codePostal, getPostalCodeValidator(true)],
    adresse: [
      structure.adresse,
      [Validators.maxLength(500), NoWhiteSpaceValidator, Validators.required],
    ],
    agrement: [
      structure.agrement,
      structure.structureType === "asso" ? [Validators.required] : [],
    ],
    capacite: [
      structure.capacite,
      structure.structureType === "asso" ? [Validators.required] : [],
    ],
    complementAdresse: [structure.complementAdresse, []],
    departement: [structure.departement, []],
    email: [
      structure.email,
      [Validators.required, Validators.email],
      emailAsyncValidators,
    ],
    nom: [
      structure.nom,
      [NoWhiteSpaceValidator, Validators.required, Validators.maxLength(255)],
    ],
    adresseCourrier: formBuilder.group({
      actif: [structure.adresseCourrier?.actif, []],
      adresse: [
        structure.adresseCourrier?.adresse,
        isEdition && addressIsRequired
          ? [Validators.required, Validators.maxLength(255)]
          : [Validators.maxLength(255)],
      ],
      ville: [
        structure.adresseCourrier?.ville,
        isEdition && addressIsRequired
          ? [Validators.required, Validators.maxLength(100)]
          : [Validators.maxLength(100)],
      ],
      codePostal: [
        structure.adresseCourrier?.codePostal,
        isEdition
          ? getPostalCodeValidator(structure.adresseCourrier?.actif)
          : [],
      ],
    }),
    options: formBuilder.group({
      numeroBoite: [structure.options?.numeroBoite ?? false, []],
      surnom: [structure.options?.surnom ?? false, []],
    }),
    telephone: new UntypedFormControl(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFormPhone(structure.telephone as any),
      [Validators.required, anyPhoneValidator]
    ),
    responsable: formBuilder.group({
      fonction: [
        structure.responsable.fonction,
        [Validators.required, Validators.maxLength(255)],
      ],
      nom: [
        structure.responsable.nom,
        [Validators.required, Validators.maxLength(255)],
      ],
      prenom: [
        structure.responsable.prenom,
        [Validators.required, Validators.maxLength(255)],
      ],
    }),
    structureType: [structure.structureType, [Validators.required]],
    organismeType: [structure.organismeType, []],
    ville: [structure.ville, [Validators.required, Validators.maxLength(255)]],
    acceptCgu: [null, []],
    reseau: [structure.reseau, null],
    siret: [structure?.siret, [siretValidator]],
    registrationData: formBuilder.group({
      source: [structure.registrationData?.source, [Validators.required]],
      sourceDetail: [structure.registrationData?.sourceDetail, []],
      activeUsersCount: [
        structure.registrationData?.activeUsersCount,
        [Validators.required, Validators.min(0)],
      ],
      dsp: [structure.registrationData?.dsp, []],
      currentTool: [
        structure.registrationData?.currentTool,
        [Validators.required],
      ],
      marketTool: [structure.registrationData?.marketTool, []],
      marketToolOther: [structure.registrationData?.marketToolOther, []],
    }),
  };

  if (isCreation) {
    baseForm.acceptCgu = [null, [Validators.requiredTrue]];
  }

  return formBuilder.group(baseForm) as UntypedFormGroup;
}

export const initCreationForm = (
  structure: StructureCommon,
  formBuilder: FormBuilder,
  validateEmailNotTaken?: (
    control: AbstractControl
  ) => Observable<ValidationErrors | null>
): FormGroup => {
  return createform(
    structure,
    formBuilder,
    FormContext.CREATION,
    validateEmailNotTaken
  );
};

export const initEditionForm = (
  structure: StructureCommon,
  formBuilder: FormBuilder,
  validateEmailNotTaken?: (
    control: AbstractControl
  ) => Observable<ValidationErrors | null>
): FormGroup => {
  return createform(
    structure,
    formBuilder,
    FormContext.EDITION,
    validateEmailNotTaken
  );
};

export const setupFormSubscriptions = (
  form: FormGroup,
  subscription: Subscription
): void => {
  subscription.add(
    form.get("structureType")?.valueChanges.subscribe((value) => {
      form.get("agrement")?.setValidators(null);
      form.get("departement")?.setValidators(null);
      form.get("organismeType")?.setValidators(null);

      const dspControl = form.get("registrationData")?.get("dsp");
      if (dspControl) {
        dspControl.setValidators(null);
      }

      if (value === "asso") {
        form.get("agrement")?.setValidators(Validators.required);
        form.get("departement")?.setValidators(Validators.required);
        form.get("organismeType")?.setValidators(Validators.required);

        if (dspControl) {
          dspControl.setValidators(Validators.required);
        }
      }

      form.get("agrement")?.updateValueAndValidity();
      form.get("departement")?.updateValueAndValidity();
      form.get("organismeType")?.updateValueAndValidity();

      if (dspControl) {
        dspControl.updateValueAndValidity();
      }
    })
  );

  subscription.add(
    form
      .get("adresseCourrier")
      ?.get("actif")
      ?.valueChanges.subscribe((value: boolean) => {
        updateComplementAdress(form, value);
      })
  );

  subscription.add(
    form
      .get("registrationData")
      ?.get("currentDomiciliationManagement")
      ?.valueChanges.subscribe((value: CurrentTool) => {
        updateCurrentToolQuestion(form, value);
      })
  );

  subscription.add(
    form
      .get("registrationData")
      ?.get("currentTool")
      ?.valueChanges.subscribe((value: CurrentTool) => {
        updateCurrentToolQuestion(form, value);
      })
  );

  subscription.add(
    form
      .get("registrationData")
      ?.get("marketTool")
      ?.valueChanges.subscribe((value: MarketTool) => {
        updateMarketToolQuestion(form, value);
      })
  );
};
