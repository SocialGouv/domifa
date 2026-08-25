import { DEPARTEMENTS_LISTE, REGIONS_LISTE } from "@domifa/common";
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

const TERRITORY_LISTS: Record<string, string[]> = {
  department: Object.keys(DEPARTEMENTS_LISTE),
  region: Object.keys(REGIONS_LISTE),
};

// Territories must be empty for national roles and must all belong to the
// list matching the role (departments or regions) otherwise.
export function IsValidGeographicRole(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isValidGeographicRole",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const role = (args.object as { role?: string }).role;
          if (!Array.isArray(value)) {
            return false;
          }
          const allowed = role ? TERRITORY_LISTS[role] : undefined;
          if (!allowed) {
            return value.length === 0;
          }
          return (
            value.length > 0 && value.every((code) => allowed.includes(code))
          );
        },
        defaultMessage(args: ValidationArguments) {
          const role = (args.object as { role?: string }).role;
          if (role === "department") {
            return `La valeur de ${args.property} doit être un département valide`;
          } else if (role === "region") {
            return `La valeur de ${args.property} doit être une région valide`;
          }
          return `${args.property} doit être vide pour ce rôle`;
        },
      },
    });
  };
}
