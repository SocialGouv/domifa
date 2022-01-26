import { IsBoolean, IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class StructureAdresseCourrierDto {
  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  public readonly actif: boolean;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.actif === true)
  public readonly adresse: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.actif === true)
  public readonly ville: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.actif === true)
  public readonly codePostal: string;
}
