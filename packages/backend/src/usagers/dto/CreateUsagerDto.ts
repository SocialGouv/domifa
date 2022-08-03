import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { UsagerAyantDroit, UsagerSexe, Telephone } from "../../_common/model";
import { UsagerAyantDroitDto } from "./UsagerAyantDroitDto";

import {
  LowerCaseTransform,
  TrimOrNullTransform,
} from "../../_common/decorators";
import { TelephoneDto } from "../../_common/dto";

export class CreateUsagerDto {
  @ApiProperty({
    example: "homme",
    required: true,
    description: "Sexe de l'usager",
  })
  @IsIn(["homme", "femme"])
  @IsNotEmpty()
  public sexe!: UsagerSexe;

  @ApiProperty({
    example: "Dubois",
    description: "Nom",
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(400)
  @TrimOrNullTransform()
  public nom: string;

  @ApiProperty({
    example: "Pierre",
    description: "Prénom",
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(400)
  @TrimOrNullTransform()
  public prenom!: string;

  @ApiProperty({
    example: "Dudu",
    description: "Surnom",
  })
  @IsOptional()
  @MaxLength(400)
  @TrimOrNullTransform()
  public surnom!: string;

  @ApiProperty({
    example: "12/12/1991",
    description: "Date de naissance",
    required: true,
    type: Date,
  })
  @IsNotEmpty()
  @IsDateString()
  public dateNaissance!: Date;

  @ApiProperty({
    example: "Saint-mandé",
    description: "Ville de naissance",
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(400)
  @TrimOrNullTransform()
  public villeNaissance!: string;

  @ApiProperty({
    example: "fr",
    required: false,
    description: "Langue parlée par l'usager",
  })
  @IsOptional()
  @TrimOrNullTransform()
  public langue!: string | null;

  @ApiProperty({
    example: "2020-1",
    required: false,
    description: "Id personnalisé",
  })
  @IsOptional()
  @TrimOrNullTransform()
  public customRef!: string;

  @ApiProperty({
    example: "test@test.fr",
    description: "Email de l'usager",
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  @TrimOrNullTransform()
  @LowerCaseTransform()
  public email!: string;

  @ApiProperty({
    type: Object,
    required: false,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TelephoneDto)
  public telephone!: Telephone;

  @IsNotEmpty()
  @IsBoolean()
  public contactByPhone!: boolean;

  @ApiProperty({
    description: "Tableau des ayants-droit",
  })
  @IsOptional()
  @IsArray()
  @ValidateIf((o) => {
    return typeof o.ayantsDroits !== "undefined"
      ? o.ayantsDroits.length > 0
        ? true
        : false
      : false;
  })
  @ValidateNested({ each: true })
  @Type(() => UsagerAyantDroitDto)
  public ayantsDroits!: UsagerAyantDroit[];
}
