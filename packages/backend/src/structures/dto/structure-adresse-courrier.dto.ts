import {
  IsBoolean,
  IsNotEmpty,
  IsPostalCode,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";

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
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public readonly adresse: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
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
