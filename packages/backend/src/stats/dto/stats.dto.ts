import { IsOptional, IsNotEmpty, IsDate, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class StatsDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsDateString()
  @IsNotEmpty()
  public start!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsDateString()
  @IsOptional()
  public end!: string;
}
