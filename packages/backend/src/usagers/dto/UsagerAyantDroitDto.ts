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
  // The frontend generates the uuid as soon as an ayant droit is added (see
  // AyantDroit in usager-shared/interfaces), so it always sends one: for a new
  // row as much as for an existing one being edited. The backend only validates
  // it — no generation here, so there's nothing custom to audit around this
  // field, @ValidateNested runs unmodified like for the rest of the DTO.
  @IsNotEmpty()
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
