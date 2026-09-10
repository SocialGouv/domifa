import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from "class-validator";

import { LIEN_PARENTE_LABELS, AyantDroiLienParent } from "@domifa/common";
import { StripTagsTransform } from "../../_common/decorators";

export class UsagerAyantDroitDto {
  // Optional: the frontend round-trips the uuid of an existing ayant droit so it
  // survives an edit that changes nom/prenom/dateNaissance/lien. New rows send ""
  // or nothing. The value is only trusted server-side if it already belongs to
  // the dossier (see withAyantsDroitsUuid).
  @ValidateIf(
    (o: UsagerAyantDroitDto) =>
      o.uuid !== undefined && o.uuid !== "" && o.uuid !== null
  )
  @IsUUID()
  public uuid?: string;

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
