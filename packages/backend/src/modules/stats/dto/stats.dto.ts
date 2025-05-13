import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsNumber } from "class-validator";

export class StatsDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  public startDate!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  public endDate!: string;

  @IsNumber()
  public structureId: number;
}
