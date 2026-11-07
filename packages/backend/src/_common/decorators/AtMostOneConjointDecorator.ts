import { registerDecorator, ValidationOptions } from "class-validator";
import { UsagerAyantDroit } from "@domifa/common";

// A dossier can only have one ayant droit of type CONJOINT: this is the
// dossier the conjoint-link feature (usagers-lien) relates to another one
// — a second CONJOINT would be silently ignored by the automatic matching
// (which only looks at the first one found) and wouldn't make business
// sense. Applied on `ayantsDroits` in CreateUsagerDto, so it covers both
// creation (POST /usagers) and editing (PATCH /usagers/:usagerRef), which
// share this same DTO.
export function AtMostOneConjoint(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "atMostOneConjoint",
      target: object.constructor,
      propertyName,
      options: {
        message: "Un seul ayant droit conjoint peut être déclaré",
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          if (!Array.isArray(value)) {
            return true;
          }
          const conjoints = (value as Partial<UsagerAyantDroit>[]).filter(
            (ayantDroit) => ayantDroit?.lien === "CONJOINT"
          );
          return conjoints.length <= 1;
        },
      },
    });
  };
}
