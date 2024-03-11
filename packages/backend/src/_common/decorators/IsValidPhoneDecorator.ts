import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from "class-validator";
import { isAnyValidPhone, isValidMobilePhone } from "../../util/phone";

export function IsValidPhone(
  property: string,
  mobileOnly: boolean = false,
  validationOptions?: ValidationOptions
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isValidPhone",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (!value && !relatedValue) {
            return false;
          }
          if (
            typeof value.numero !== "string" ||
            typeof relatedValue.numero !== "string" ||
            typeof value.countryCode !== "string" ||
            typeof relatedValue.countryCode !== "string"
          ) {
            return false;
          }

          return mobileOnly
            ? isValidMobilePhone(value)
            : isAnyValidPhone(value);
        },
      },
    });
  };
}
