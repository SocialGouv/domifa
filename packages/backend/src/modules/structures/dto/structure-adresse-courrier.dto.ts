import {
  IsBoolean,
  IsNotEmpty,
  IsPostalCode,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { Trim } from "../../../_common/decorators";

export class StructureAdresseCourrierDto {
  @IsBoolean()
  @IsNotEmpty()
  public readonly actif: boolean;

  @ValidateIf((o) => o.actif === true)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Trim()
  public readonly adresse: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Trim()
  @ValidateIf((o) => o.actif === true)
  public readonly ville: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  @ValidateIf((o) => o.actif === true)
  @IsPostalCode("FR")
  public readonly codePostal: string;
}
