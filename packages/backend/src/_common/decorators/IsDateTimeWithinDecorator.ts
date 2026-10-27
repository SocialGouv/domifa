import { registerDecorator, ValidationOptions } from "class-validator";

// The date must be between now - maxPastMs and now + maxFutureMs
export function IsDateTimeWithin(
  { maxPastMs, maxFutureMs }: { maxPastMs: number; maxFutureMs: number },
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isDateTimeWithin",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== "string") {
            return false;
          }
          const time = new Date(value).getTime();
          if (Number.isNaN(time)) {
            return false;
          }
          const now = Date.now();
          return time >= now - maxPastMs && time <= now + maxFutureMs;
        },
        defaultMessage() {
          return "DATE_OUT_OF_RANGE";
        },
      },
    });
  };
}
