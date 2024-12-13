import {
  UsagerSexe,
  COUNTRIES,
  Telephone,
  UsagerAyantDroit,
} from "@domifa/common";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsDateString,
  IsEmail,
  IsObject,
  IsBoolean,
  IsArray,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import {
  Trim,
  StripTagsTransform,
  TrimOrNullTransform,
  LowerCaseTransform,
  IsValidPhone,
} from "../../../_common/decorators";
import { UsagerAyantDroitDto } from "../UsagerAyantDroitDto";

export class CreateUsagerDto {
  @ApiProperty({
    example: "homme",
    required: true,
    description: "Sexe du domicilié",
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
  @MaxLength(200)
  @Trim()
  @StripTagsTransform()
  public nom: string;

  @ApiProperty({
    example: "Pierre",
    description: "Prénom",
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(200)
  @IsString()
  @Trim()
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
  @MaxLength(100)
  @IsString()
  @StripTagsTransform()
  @Trim()
  public villeNaissance!: string;

  @ApiProperty({
    example: "fr",
    required: false,
    description: "Langue parlée par l'usager",
  })
  @IsOptional()
  @IsString()
  @TrimOrNullTransform()
  @StripTagsTransform()
  public langue!: string | null;

  @ApiProperty({
    example: "Congo",
    required: false,
    description: "Nationalité",
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(COUNTRIES))
  public nationalite!: string | null;

  @ApiProperty({
    example: "2020-1",
    required: false,
    description: "Id personnalisé",
  })
  @IsOptional()
  @IsString()
  @StripTagsTransform()
  @TrimOrNullTransform()
  @MaxLength(50)
  public customRef!: string;

  @ApiProperty({
    example: "test@test.fr",
    description: "Email du domicilié",
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
  @IsValidPhone("telephone", false, true)
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
  @MaxLength(50)
  @IsString()
  @StripTagsTransform()
  @TrimOrNullTransform()
  public numeroDistribution!: string;
}
