import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";

import { UsagerAyantDroitDto } from "./UsagerAyantDroitDto";

import {
  LowerCaseTransform,
  StripTagsTransform,
  TrimOrNullTransform,
} from "../../_common/decorators";
import { Telephone, UsagerAyantDroit, UsagerSexe } from "@domifa/common";
import { IsValidPhone } from "../../_common/decorators/IsValidPhoneDecorator";

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
  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  @StripTagsTransform()
  public nom: string;

  @ApiProperty({
    example: "Pierre",
    description: "Prénom",
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(400)
  @IsString()
  @StripTagsTransform()
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
  @IsString()
  @StripTagsTransform()
  public villeNaissance!: string;

  @ApiProperty({
    example: "fr",
    required: false,
    description: "Langue parlée par l'usager",
  })
  @IsOptional()
  @IsString()
  @StripTagsTransform()
  public langue!: string | null;

  @ApiProperty({
    example: "2020-1",
    required: false,
    description: "Id personnalisé",
  })
  @IsOptional()
  @IsString()
  @StripTagsTransform()
  @TrimOrNullTransform()
  public customRef!: string;

  @ApiProperty({
    example: "test@test.fr",
    description: "Email de l'usager",
  })
  @IsOptional()
  @IsEmail()
  @TrimOrNullTransform()
  @LowerCaseTransform()
  public email!: string;

  @ApiProperty({
    type: Object,
    required: false,
  })
  @IsObject()
  @IsNotEmpty()
  @IsValidPhone("telephone", true)
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
    return o?.ayantsDroits?.length > 0;
  })
  @ValidateNested({ each: true })
  @Type(() => UsagerAyantDroitDto)
  public ayantsDroits!: UsagerAyantDroit[];

  @ApiProperty({
    example: "TSA 19000, BP 100",
    description: "Numéro de TSA ou boite postale",
    required: false,
  })
  @IsOptional()
  @MaxLength(100)
  @IsString()
  @StripTagsTransform()
  public numeroDistribution!: string;
}
