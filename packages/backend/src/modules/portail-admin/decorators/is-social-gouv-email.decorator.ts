import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isEmail,
} from "class-validator";

export function IsSocialGouvEmailIfSuperAdmin(
  validationOptions?: ValidationOptions
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isSocialGouvEmailIfSuperAdmin",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: ["role"],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;

          if (obj.role !== "super-admin-domifa") {
            return true;
          }

          if (!value) {
            return false;
          }
          value = value.toString().toLowerCase();
          return (
            typeof value === "string" &&
            isEmail(value) &&
            (value.endsWith("@externes.social.gouv.fr") ||
              value.endsWith("@fabrique.social.gouv.fr"))
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        defaultMessage(_args: ValidationArguments) {
          return "Pour le rôle super-admin-domifa, l'email doit se terminer par @fabrique.social.gouv.fr ou @externes.social.gouv.fr";
        },
      },
    });
  };
}
