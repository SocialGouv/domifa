import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from "class-validator";
import { isAnyValidPhone, isValidMobilePhone } from "../../util/phone";
import { BadRequestException } from "@nestjs/common";

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, _args: ValidationArguments) {
          const result = validatePhoneValue(value, required, mobileOnly);
          if (!result.isValid) {
            throw new BadRequestException({
              message: result.message.replace("{property}", propertyName),
              error: "INVALID_PHONE_FORMAT",
              field: propertyName,
            });
          }
          return result.isValid;
        },
      },
    });
  };
}
interface ValidationResult {
  isValid: boolean;
  message: string;
}

function validatePhoneValue(
  value: any,
  required: boolean,
  mobileOnly: boolean
): ValidationResult {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch (e) {
      return {
        isValid: false,
        message:
          "Le format du numéro de téléphone pour {property} est invalide",
      };
    }
  }

  if (!value?.numero) {
    return required
      ? {
          isValid: false,
          message: "Le numéro de téléphone est requis pour {property}",
        }
      : {
          isValid: true,
          message: "",
        };
  }

  if (
    typeof value.numero !== "string" ||
    typeof value.countryCode !== "string"
  ) {
    return {
      isValid: !required,
      message:
        "Le format du numéro de téléphone est invalide pour {property}. Il doit contenir un numéro et un code pays correct",
    };
  }

  const isValid = mobileOnly
    ? isValidMobilePhone(value)
    : isAnyValidPhone(value);

  return {
    isValid,
    message: mobileOnly
      ? "{property} doit être un numéro de téléphone mobile valide"
      : "{property} doit être un numéro de téléphone valide",
  };
}
