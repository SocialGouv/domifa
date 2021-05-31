import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty } from "class-validator";

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

  @ApiProperty({
    type: Number,
    required: true,
  })
  @IsNotEmpty()
  structureId!: number;
}
