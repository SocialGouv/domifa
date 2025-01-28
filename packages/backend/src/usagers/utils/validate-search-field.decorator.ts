import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from "class-validator";
import { validateSearchField } from "./validate-search-field";

export function ValidateSearchField(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "validateSearchField",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const searchStringField = args.object["searchStringField"];
          if (!searchStringField) {
            return false;
          }
          return validateSearchField(value, searchStringField);
        },
        defaultMessage(args: ValidationArguments) {
          const searchStringField = args.object["searchStringField"];
          if (!searchStringField) {
            return "Le type de recherche est requis";
          }
          return "La valeur de recherche est invalide pour le type spécifié";
        },
      },
    });
  };
}
