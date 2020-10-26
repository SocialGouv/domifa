import { IsBoolean, IsNotEmpty, IsOptional, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class TransfertDto {
  @IsOptional()
  @IsBoolean()
  public actif!: boolean;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  public nom!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @MinLength(10)
  public adresse!: string;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  public dateDebut!: Date;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  public dateFin!: Date;
}
