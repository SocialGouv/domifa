import { Transform } from "class-transformer";
import { IsInt, Min, ValidateIf } from "class-validator";

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
    return Number(value);
  })
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(1)
  newReferrerId: number | null;
}
