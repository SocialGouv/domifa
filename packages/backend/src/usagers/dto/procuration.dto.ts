import { IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ProcurationDto {
  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsOptional()
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
  public prenom!: string;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  public dateFin!: Date;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  public dateDebut!: Date;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  public dateNaissance!: string;
}
