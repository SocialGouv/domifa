import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import {
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";

export function isInvalidStructureName(structureName: string): boolean {
  if (!structureName) {
    return false;
  }
  const name = structureName.toLowerCase().trim();
  return (
    name === "ccas" ||
    name === "c.c.a.s." ||
    name === "centre communal d'action sociale" ||
    name === "mairie"
  );
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
