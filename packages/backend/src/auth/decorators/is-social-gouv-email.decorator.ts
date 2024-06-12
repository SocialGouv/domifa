import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isEmail,
} from "class-validator";

export function IsSocialGouvEmail(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isValidPassword",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [propertyName],
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, _args: ValidationArguments) {
          return (
            typeof value === "string" &&
            isEmail(value) &&
            (value.endsWith("@social.gouv.fr") ||
              value.endsWith("@fabrique.social.gouv.fr"))
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        defaultMessage(_args: ValidationArguments) {
          return "Email must end with @social.gouv.fr";
        },
      },
    });
  };
}
