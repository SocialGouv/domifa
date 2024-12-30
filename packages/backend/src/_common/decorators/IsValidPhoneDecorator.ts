import { ValidationOptions, registerDecorator } from "class-validator";
import { isAnyValidPhone, isValidMobilePhone } from "../../util/phone";

export function IsValidPhone(
  property: string,
  required: boolean = false,
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
        validate(value: any) {
          if (typeof value === "string") {
            try {
              value = JSON.parse(value);
            } catch (e) {
              return false;
            }
          }

          if (!value?.numero && required) {
            return false;
          }

          if (
            typeof value.numero !== "string" ||
            typeof value.countryCode !== "string"
          ) {
            return !required;
          }

          return mobileOnly
            ? isValidMobilePhone(value)
            : isAnyValidPhone(value);
        },
      },
    });
  };
}
