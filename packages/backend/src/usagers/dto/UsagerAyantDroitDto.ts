import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
} from "class-validator";

import { LIEN_PARENTE_LABELS, AyantDroiLienParent } from "@domifa/common";
import { StripTagsTransform } from "../../_common/decorators";

export class UsagerAyantDroitDto {
  @IsNotEmpty()
  @MaxLength(200)
  @IsString()
  @StripTagsTransform()
  public nom!: string;

  @IsNotEmpty()
  @MaxLength(200)
  @StripTagsTransform()
  @IsString()
  public prenom!: string;

  @IsNotEmpty()
  @IsString()
  @StripTagsTransform()
  @IsIn(Object.keys(LIEN_PARENTE_LABELS))
  public lien!: AyantDroiLienParent;

  @IsNotEmpty()
  @IsDateString()
  public dateNaissance!: Date;
}
