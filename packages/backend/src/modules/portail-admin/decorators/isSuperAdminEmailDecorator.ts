import { isSuperAdminEmailDomain } from "@domifa/common";
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

// A `super-admin-domifa` account must use one of SUPER_ADMIN_EMAIL_DOMAINS.
// Other roles are not restricted.
export function IsValidSuperAdminEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isValidSuperAdminEmail",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const role = (args.object as { role?: string }).role;
          if (role !== "super-admin-domifa") {
            return true;
          }
          return typeof value === "string" && isSuperAdminEmailDomain(value);
        },
        defaultMessage() {
          return "Cet email ne peut pas être utilisé pour un compte super-admin-domifa";
        },
      },
    });
  };
}
