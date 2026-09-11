import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

import { LIEN_PARENTE_LABELS, AyantDroiLienParent } from "@domifa/common";
import { StripTagsTransform } from "../../_common/decorators";

export class UsagerAyantDroitDto {
  // An existing ayant droit round-trips its uuid so it survives an edit that
  // changes nom/prenom/dateNaissance/lien. New rows get one from the array-level
  // @Transform on CreateUsagerDto.ayantsDroits.
  @IsUUID()
  public uuid!: string;

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
