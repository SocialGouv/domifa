import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
} from "class-validator";

import { LIEN_PARENTE_LABELS, AyantDroiLienParent } from "@domifa/common";
import { StripTagsTransform, Trim } from "../../_common/decorators";

export class UsagerAyantDroitDto {
  @ApiProperty({
    example: "Dubois",
    description: "Nom",
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(200)
  @IsString()
  @StripTagsTransform()
  @Trim()
  public nom!: string;

  @ApiProperty({
    example: "Pierre",
    required: true,
    description: "Prénom",
  })
  @IsNotEmpty()
  @MaxLength(200)
  @StripTagsTransform()
  @IsString()
  @Trim()
  public prenom!: string;

  @ApiProperty({
    example: "CONJOINT",
    required: true,
    description: "Lien de parenté",
  })
  @IsNotEmpty()
  @IsString()
  @StripTagsTransform()
  @Trim()
  @IsIn(Object.keys(LIEN_PARENTE_LABELS))
  public lien!: AyantDroiLienParent;

  @ApiProperty({
    example: "20/12/2002",
    description: "Date de naissance de l'ayant-droit",
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  @IsDateString()
  public dateNaissance!: Date;
}
