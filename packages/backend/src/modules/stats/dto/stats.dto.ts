import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from "class-validator";

export class StatsDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsDateString({ strict: true, strictSeparator: true })
  @IsNotEmpty()
  public startDate!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsDateString({ strict: true, strictSeparator: true })
  @IsNotEmpty()
  public endDate!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  public structureId: number;
}
