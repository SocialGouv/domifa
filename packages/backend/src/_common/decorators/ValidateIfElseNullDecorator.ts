import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";
import { ValidateIf } from "class-validator";

type FieldCondition = (object: any, value?: any) => boolean;

// Validates the field when `condition` holds, otherwise forces it to null so
// that a skipped validation never lets an arbitrary value reach persistence.
export function ValidateIfElseNull(
  condition: FieldCondition
): PropertyDecorator {
  return applyDecorators(
    ValidateIf(condition),
    Transform(({ value, obj }) => (condition(obj, value) ? value : null))
  );
}
