import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsIn, IsNotEmpty } from "class-validator";

import { TrimOrNullTransform } from "../../_common/decorators";
import { LIEN_PARENTE_LABELS, AyantDroiLienParent } from "@domifa/common";

export class UsagerAyantDroitDto {
  @ApiProperty({
    example: "Dubois",
    description: "Nom",
    required: true,
  })
  @IsNotEmpty()
  @TrimOrNullTransform()
  public nom!: string;

  @ApiProperty({
    example: "Pierre",
    required: true,
    description: "Prénom",
  })
  @IsNotEmpty()
  @TrimOrNullTransform()
  public prenom!: string;

  @ApiProperty({
    example: "Dudu",
    required: true,
    description: "Surnom",
  })
  @IsNotEmpty()
  @IsIn(Object.keys(LIEN_PARENTE_LABELS))
  @TrimOrNullTransform()
  public lien!: AyantDroiLienParent;

  @ApiProperty({
    example: "20/12/2002",
    description: "Date de naissance de l'ayant-droit",
    type: Date,
  })
  @IsNotEmpty()
  @IsDateString()
  public dateNaissance!: Date;
}
