import {
  IsBoolean,
  IsNotEmpty,
  IsPostalCode,
  IsString,
  MaxLength,
} from "class-validator";
import { Trim, ValidateIfElseNull } from "../../../_common/decorators";

export class StructureAdresseCourrierDto {
  @IsBoolean()
  @IsNotEmpty()
  public readonly actif: boolean;

  @ValidateIfElseNull((o) => o.actif === true)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Trim()
  public readonly adresse: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Trim()
  @ValidateIfElseNull((o) => o.actif === true)
  public readonly ville: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  @ValidateIfElseNull((o) => o.actif === true)
  @IsPostalCode("FR")
  public readonly codePostal: string;
}
