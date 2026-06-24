import {
  FormBuilder,
  FormGroup,
  Validators,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import {
  CurrentTool,
  MarketTool,
  StructureCommon,
  StructureOrganismeType,
} from "@domifa/common";
import { Subscription } from "rxjs";

import { setFormPhone, anyPhoneValidator } from "../../../shared/phone";
import {
  getPostalCodeValidator,
  siretValidator,
  updateComplementAdress,
  updateCurrentToolQuestion,
  updateMarketToolQuestion,
  updateOrganismeTypeQuestion,
} from "./structure-validators";
import { NoWhiteSpaceValidator } from "../../../shared";

enum FormContext {
  CREATION = "creation",
  EDITION = "edition",
}

export function createform(
  structure: StructureCommon,
  formBuilder: FormBuilder,
  context: FormContext
): UntypedFormGroup {
  const addressIsRequired = structure.adresseCourrier?.actif === true;

  const isCreation = context === FormContext.CREATION;
  const isEdition = context === FormContext.EDITION;

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
    departement: [
      structure.departement,
      structure.structureType === "asso" ? [Validators.required] : [],
    ],
    email: [structure.email, [Validators.required, Validators.email]],
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
      numeroBoite: [structure.options?.numeroBoite ?? true, []],
      nomStructure: [structure.options?.nomStructure ?? true, []],
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
    organismeType: [
      structure.organismeType,
      structure.structureType === "asso" ? [Validators.required] : [],
    ],
    organismeTypeDetail: [
      structure.organismeTypeDetail,
      structure.structureType === "asso" && structure.organismeType === "AUTRE"
        ? [Validators.required, Validators.maxLength(200)]
        : [Validators.maxLength(200)],
    ],
    ville: [structure.ville, [Validators.required, Validators.maxLength(255)]],
    acceptCgu: [null, []],
    reseau: [
      structure.reseau,
      structure.structureType === "asso" ? [Validators.required] : [],
    ],
    reseauDetail: [
      structure.reseauDetail,
      structure.structureType === "asso" && structure.reseau === "Autre réseau"
        ? [Validators.required, Validators.maxLength(100)]
        : [Validators.maxLength(100)],
    ],
    siret: [
      structure?.siret,
      structure?.noSiret
        ? [siretValidator]
        : [siretValidator, Validators.required],
    ],
    noSiret: [structure?.noSiret ?? null, []],
    registrationData: formBuilder.group({
      source: [structure.registrationData?.source, [Validators.required]],
      sourceDetail: [structure.registrationData?.sourceDetail, []],
      activeUsersCount: [
        structure.registrationData?.activeUsersCount ?? 0,
        [Validators.required, Validators.min(0)],
      ],
      currentTool: [
        structure.registrationData?.currentTool,
        [Validators.required],
      ],
      marketTool: [structure.registrationData?.marketTool, []],
      marketToolOther: [structure.registrationData?.marketToolOther, []],
      dsp: [
        structure?.registrationData?.dsp ?? null,
        structure.structureType === "asso" ? [Validators.required] : [],
      ],
    }),
  };

  if (isCreation) {
    baseForm.acceptCgu = [null, [Validators.requiredTrue]];
  }

  return formBuilder.group(baseForm) as UntypedFormGroup;
}

export const initCreationForm = (
  structure: StructureCommon,
  formBuilder: FormBuilder
): FormGroup => {
  return createform(structure, formBuilder, FormContext.CREATION);
};

export const initEditionForm = (
  structure: StructureCommon,
  formBuilder: FormBuilder
): FormGroup => {
  return createform(structure, formBuilder, FormContext.EDITION);
};

const updateReseauDetailValidator = (form: FormGroup): void => {
  const isAsso = form.get("structureType")?.value === "asso";
  const isAutreReseau = form.get("reseau")?.value === "Autre réseau";
  const control = form.get("reseauDetail");
  if (isAsso && isAutreReseau) {
    control?.setValidators([Validators.required, Validators.maxLength(100)]);
  } else {
    control?.setValidators([Validators.maxLength(100)]);
  }
  control?.updateValueAndValidity({ emitEvent: false });
};

export const setupFormSubscriptions = (
  form: FormGroup,
  subscription: Subscription
): void => {
  subscription.add(
    form.get("structureType")?.valueChanges.subscribe((value) => {
      const assoOnlyFields = [
        "agrement",
        "departement",
        "organismeType",
        "capacite",
        "reseau",
      ];

      assoOnlyFields.forEach((name) => form.get(name)?.setValidators(null));
      form.get("registrationData")?.get("dsp")?.setValidators(null);

      if (value === "asso") {
        assoOnlyFields.forEach((name) =>
          form.get(name)?.setValidators(Validators.required)
        );
        form
          .get("registrationData")
          ?.get("dsp")
          ?.setValidators(Validators.required);
      } else {
        form.get("reseauDetail")?.setValue(null);
      }

      assoOnlyFields.forEach((name) =>
        form.get(name)?.updateValueAndValidity()
      );
      form.get("registrationData")?.get("dsp")?.updateValueAndValidity();
      updateReseauDetailValidator(form);
      updateOrganismeTypeQuestion(
        form,
        form.get("organismeType")?.value as StructureOrganismeType | null
      );
    })
  );

  subscription.add(
    form.get("reseau")?.valueChanges.subscribe(() => {
      if (form.get("reseau")?.value !== "Autre réseau") {
        form.get("reseauDetail")?.setValue(null);
      }
      updateReseauDetailValidator(form);
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
    form.get("noSiret")?.valueChanges.subscribe((value) => {
      const siretFormControl = form.get("siret");
      if (value) {
        siretFormControl?.setValue(null);
        siretFormControl?.setValidators([siretValidator]);
      } else {
        siretFormControl?.setValidators([siretValidator, Validators.required]);
      }
      siretFormControl?.updateValueAndValidity();
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

  subscription.add(
    form
      .get("organismeType")
      ?.valueChanges.subscribe((value: StructureOrganismeType | null) => {
        updateOrganismeTypeQuestion(form, value);
      })
  );
};
