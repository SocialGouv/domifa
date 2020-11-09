import { IsOptional, IsNotEmpty, IsDate, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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
}
