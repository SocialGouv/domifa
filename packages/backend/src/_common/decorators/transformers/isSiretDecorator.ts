import { isSIRET } from "@domifa/common";
import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from "class-validator";

export const IsSIRET = (validationOptions?: ValidationOptions) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isSIRET",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          if (!value) {
            return true;
          }
          const siret = args.object["siret"];
          return isSIRET(siret);
        },
        defaultMessage() {
          return "SIRET must be a valid 14-digit number";
        },
      },
    });
  };
};
