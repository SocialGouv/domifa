import { Transform } from "class-transformer";
import { IsOptional, IsInt, ValidateIf } from "class-validator";

export class NewReferrerIdDto {
  @Transform(({ value }) => {
    console.log(value);
    if (value === null || value === undefined || value === "") return null;
    return typeof value === "number" ? value : null;
  })
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @IsOptional()
  newReferrerId?: number | null;
}
