import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  Min,
  ValidateIf,
} from "class-validator";

export class AssignReferrersDto {
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
  @IsOptional()
  newReferrerId: number | null;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @IsInt({ each: true })
  @Min(1, { each: true })
  usagersRefs: number[];
}
