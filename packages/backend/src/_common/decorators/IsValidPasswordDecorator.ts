import { registerDecorator, ValidationOptions } from "class-validator";

export function IsValidPassword(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(password: any) {
          if (typeof password === "string") {
            return new RegExp(
              /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])[a-zA-Z0-9!\"#$%&'()*+,-./:;<=>?@\[\]_]{12,}$/
            ).test(password);
          }
          return false;
        },
      },
    });
  };
}
