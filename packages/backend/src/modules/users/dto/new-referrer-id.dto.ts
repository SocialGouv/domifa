import { Transform } from "class-transformer";
import { IsInt, IsOptional, Min, ValidateIf } from "class-validator";
import { toStrictInt } from "../../../_common/decorators";

export class NewReferrerIdDto {
  @Transform(({ value }) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "null" ||
      value === "undefined"
    ) {
      return null;
    }
    return toStrictInt(value);
  })
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(1)
  @IsOptional()
  newReferrerId: number | null;
}
