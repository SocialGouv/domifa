import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

export function IsValidPassword(
  property: string,
  validationOptions?: ValidationOptions
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isValidPassword",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return checkPasswordStrength(value, relatedValue);
        },
      },
    });
  };
}

export function checkPasswordStrength(
  value?: any,
  relatedValue?: any
): boolean {
  if (!value && !relatedValue) {
    return false;
  }
  if (typeof value !== "string" && typeof relatedValue !== "string") {
    return false;
  }

  if (value.length > 150 || value.length < 12) {
    return false;
  }
  return new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[^]{12,}$/).test(value);
}
