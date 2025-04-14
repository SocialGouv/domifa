import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from "class-validator";

export class StatsDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  public start!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  public end!: string;

  @IsOptional()
  @IsNumber()
  public structureId: number;
}
