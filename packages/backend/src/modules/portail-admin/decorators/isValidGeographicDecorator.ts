import { DEPARTEMENTS_LISTE, REGIONS_LISTE } from "@domifa/common";
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function IsValidGeographicRole(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "isValidGeographicRole",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const role = obj.role;
          if (role === "national" || role === "super-admin-domifa") {
            return true;
          }
          if (!value?.length) return false;

          const departmentOrRegion = value[0];
          if (role === "department") {
            return Object.keys(DEPARTEMENTS_LISTE).includes(departmentOrRegion);
          } else if (role === "region") {
            return Object.keys(REGIONS_LISTE).includes(departmentOrRegion);
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as any;
          const role = obj.role;

          if (role === "département") {
            return `La valeur de ${args.property} doit être un département valide`;
          } else if (role === "region") {
            return `La valeur de ${args.property} doit être une région valide`;
          }

          return `Valeur invalide pour ${args.property}`;
        },
      },
    });
  };
}
