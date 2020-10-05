import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from "class-validator";
import { AyantDroit } from "../interfaces/ayant-droit";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUsagerDto {
  @ApiProperty({
    example: "homme",
    description: "Sexe de l'usager",
  })
  @IsIn(["homme", "femme"])
  public sexe!: string;

  @ApiProperty({
    example: "2020-1",
    description: "Id personnalisé",
  })
  @IsOptional()
  public customId!: string;

  @ApiProperty({
    example: "Dubois",
    description: "Nom",
  })
  @IsNotEmpty()
  public nom!: string;

  @ApiProperty({
    example: "Pierre",
    description: "Prénom",
  })
  @IsNotEmpty()
  public prenom!: string;

  @ApiProperty({
    example: "Dudu",
    description: "Surnom",
  })
  @IsOptional()
  public surnom!: string;

  @ApiProperty({
    example: "Pierre",
    description: "Prénom",
  })
  @IsNotEmpty()
  public dateNaissance!: Date;

  @ApiProperty({
    example: "Saint-mandé",
    description: "Ville de naissance",
  })
  @IsNotEmpty()
  public villeNaissance!: string;

  @ApiProperty()
  @IsOptional()
  public email!: string;

  @ApiProperty()
  @IsOptional()
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
  @IsIn(["RENOUVELLEMENT", "PREMIERE"])
  public typeDom!: string;

  @ApiProperty()
  @IsOptional()
  public preference!: {
    email: boolean;
    phone: boolean;
  };

  @ApiProperty({
    description: "Tableau des ayants droit",
  })
  @IsOptional()
  public ayantsDroits!: AyantDroit[];
}
