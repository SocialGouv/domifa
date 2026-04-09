import { Transform } from "class-transformer";
import { IsOptional, IsInt, Min, ValidateIf } from "class-validator";

export class NewReferrerIdDto {
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === "") return null;
    return Number(value);
  })
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(1)
  @IsOptional()
  newReferrerId?: number | null;
}
