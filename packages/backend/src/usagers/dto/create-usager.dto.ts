import { ApiProperty } from "@nestjs/swagger";
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";
import {
  UsagerAyantDroit,
  UsagerSexe,
  UsagerTypeDom,
} from "../../_common/model";

export class CreateUsagerDto {
  @ApiProperty({
    example: "homme",
    description: "Sexe de l'usager",
  })
  @IsIn(["homme", "femme"])
  public sexe!: UsagerSexe;

  @ApiProperty({
    example: "fr",
    description: "Langue parlée par l'usager",
  })
  @IsOptional()
  public langue!: string;

  @ApiProperty({
    example: "2020-1",
    description: "Id personnalisé",
  })
  @IsOptional()
  public customRef!: string;

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
  @IsIn(["RENOUVELLEMENT", "PREMIERE_DOM"])
  public typeDom!: UsagerTypeDom;

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
  public ayantsDroits!: UsagerAyantDroit[];
}
