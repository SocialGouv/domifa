import { UsagerPreferenceContact } from "./../../_common/model/usager/UsagerPreferenceContact.type";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import {
  UsagerAyantDroit,
  UsagerSexe,
  UsagerTypeDom,
} from "../../_common/model";
import { UsagerAyantDroitDto } from "./UsagerAyantDroitDto";
import { PreferenceContactDto } from ".";
import { ValidationRegexp } from "../controllers/import/step2-validate-row";

export class CreateUsagerDto {
  @ApiProperty({
    example: "homme",
    required: true,
    description: "Sexe de l'usager",
  })
  @IsIn(["homme", "femme"])
  public sexe!: UsagerSexe;

  @ApiProperty({
    example: "Dubois",
    description: "Nom",
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(400)
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public nom!: string;

  @ApiProperty({
    example: "Pierre",
    description: "Prénom",
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(400)
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public prenom!: string;

  @ApiProperty({
    example: "Dudu",
    description: "Surnom",
  })
  @IsOptional()
  @MaxLength(400)
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
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
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public villeNaissance!: string;

  @ApiProperty({
    example: "fr",
    required: false,
    description: "Langue parlée par l'usager",
  })
  @IsOptional()
  public langue!: string | null;

  @ApiProperty({
    example: "2020-1",
    description: "Id personnalisé",
  })
  @IsOptional()
  public customRef!: string;

  @ApiProperty({
    example: "test@test.fr",
    description: "Email de l'usager",
  })
  @IsOptional()
  @ValidateIf((o) => o.email !== "")
  @IsEmail()
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public email!: string;

  @ApiProperty({
    example: "0606060606",
    description: "Téléphone",
  })
  @IsOptional()
  @ValidateIf((o) => o.phone !== "")
  @Matches(ValidationRegexp.phone)
  public phone!: string;

  @ApiProperty({
    description: "Dernière étape enregistrée",
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  public etapeDemande!: number;

  @ApiProperty()
  @IsOptional()
  @IsIn(["RENOUVELLEMENT", "PREMIERE_DOM"])
  public typeDom!: UsagerTypeDom;

  @ApiProperty({
    description: "Préférences de contact",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PreferenceContactDto)
  public preference!: UsagerPreferenceContact;

  @ApiProperty({
    description: "Tableau des ayants-droit",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UsagerAyantDroitDto)
  public ayantsDroits!: UsagerAyantDroit[];
}
