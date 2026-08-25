import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from "class-validator";

export class StatsDto {
  @IsDateString({ strict: true, strictSeparator: true })
  @IsNotEmpty()
  public startDate!: string;

  @IsDateString({ strict: true, strictSeparator: true })
  @IsNotEmpty()
  public endDate!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  public structureId: number;
}
