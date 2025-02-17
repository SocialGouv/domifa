import { Transform } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt, IsOptional, Min } from "class-validator";

export class AssignReferrersDto {
  @Transform(({ value }) => (value ? parseInt(value, 10) : null))
  @IsOptional()
  @IsInt()
  newReferrerId: number | null;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  usagersRefs: number[];
}
