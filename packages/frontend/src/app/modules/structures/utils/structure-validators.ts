import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import {
  CurrentTool,
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
  isSIRET,
  MarketTool,
  RegistrationSources,
  SOURCES_OPTIONS,
} from "@domifa/common";
import slug from "slug";

export function isInvalidStructureName(structureName: string): boolean {
  if (!structureName) {
    return false;
  }

  const normalizedInput = slug(structureName, {
    mode: "rfc3986" as const,
    lower: true,
    replacement: " ", // Utiliser des espaces au lieu des tirets
    remove: /[^a-z0-9\s]/g, // Supprimer tous les caractères non alphanumériques sauf les espaces
    locale: "fr", // Utiliser explicitement la locale française
    trim: true,
  });

  return [
    "ccas",
    "commune",
    "centre communal",
    "centre communal daction sociale",
    "centre daction sociale",
    "mairie",
    "hotel de ville",
  ].includes(normalizedInput);
}

export const getPostalCodeValidator = (
  actif: boolean
): ValidatorFn[] | null => {
  return actif === true
    ? [
        Validators.maxLength(5),
        Validators.minLength(4),
        Validators.required,
        codePostalValidator(),
      ]
    : null;
};

export function codePostalValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const postalCode = control.value;
    const testCode = RegExp(/^\d[0-9AB]\d{3}$/).test(postalCode);
    if (testCode) {
      try {
        const departement = getDepartementFromCodePostal(postalCode);
        getRegionCodeFromDepartement(departement);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Validation error for postalCode "${postalCode}"`, err);
        return { codepostal: false };
      }
      return null;
    }

    return { codepostal: false };
  };
}
export const updateCurrentToolQuestion = (
  structureForm: FormGroup,
  value: CurrentTool
) => {
  const marketToolField = structureForm
    .get("registrationData")
    ?.get("marketTool");
  const marketToolOtherField = structureForm
    .get("registrationData")
    ?.get("marketToolOther");

  if (value === "OUTIL_MARCHE") {
    marketToolField?.setValidators([Validators.required]);
  } else {
    marketToolField?.clearValidators();
    marketToolField?.setValue(null);
    marketToolOtherField?.clearValidators();
    marketToolOtherField?.setValue(null);
  }
  marketToolField?.updateValueAndValidity();
  marketToolOtherField?.updateValueAndValidity();
};

export const updateMarketToolQuestion = (
  structureForm: FormGroup,
  value: MarketTool
) => {
  const marketToolOtherField = structureForm
    .get("registrationData")
    ?.get("marketToolOther");

  if (value === "AUTRE") {
    marketToolOtherField?.setValidators([Validators.required]);
  } else {
    marketToolOtherField?.clearValidators();
    marketToolOtherField?.setValue(null);
  }
  marketToolOtherField?.updateValueAndValidity();
};

export const updateSourceQuestion = (
  structureForm: FormGroup,
  value: RegistrationSources
) => {
  let showSourceDetail = false;
  const selectedOption = SOURCES_OPTIONS.find((opt) => opt.value === value);

  const detailControl = structureForm
    .get("registrationData")
    ?.get("sourceDetail");

  showSourceDetail = !!selectedOption?.requiresDetail;

  if (showSourceDetail) {
    detailControl?.setValidators([Validators.required]);
  } else {
    detailControl?.clearValidators();
    detailControl?.setValue(null);
  }

  detailControl?.updateValueAndValidity();
  return showSourceDetail;
};

export const updateComplementAdress = (
  structureForm: FormGroup,
  actif: boolean
): void => {
  const isRequired = actif === true ? [Validators.required] : null;

  structureForm
    .get("adresseCourrier")
    ?.get("adresse")
    ?.setValidators(isRequired);
  structureForm
    .get("adresseCourrier")
    ?.get("codePostal")
    ?.setValidators(getPostalCodeValidator(actif));
  structureForm.get("adresseCourrier")?.get("ville")?.setValidators(isRequired);

  structureForm
    .get("adresseCourrier")
    ?.get("adresse")
    ?.updateValueAndValidity();
  structureForm
    .get("adresseCourrier")
    ?.get("codePostal")
    ?.updateValueAndValidity();
  structureForm.get("adresseCourrier")?.get("ville")?.updateValueAndValidity();
};

export function siretValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  return isSIRET(value) ? null : { invalidSiret: true };
}
