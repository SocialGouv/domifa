import {
  IsBoolean,
  IsNotEmpty,
  IsPostalCode,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Trim } from "../../../_common/decorators";

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
  @ValidateIf((o) => o.actif === true)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Trim()
  public readonly adresse: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Trim()
  @ValidateIf((o) => o.actif === true)
  public readonly ville: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  @ValidateIf((o) => o.actif === true)
  @IsPostalCode("FR")
  public readonly codePostal: string;
}
