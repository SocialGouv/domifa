import { IsIn, IsOptional, ValidateIf, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SearchDto {
  @ApiProperty({
    enum: [
      "VALIDE",
      "TOUS",
      "ATTENTE_DECISION",
      "REFUS",
      "RADIE",
      "INSTRUCTION",
      "EXPIRE",
      "RENOUVELLEMENT",
    ],
    type: String,
  })
  @IsOptional()
  @IsIn([
    "VALIDE",
    "TOUS",
    "ATTENTE_DECISION",
    "REFUS",
    "RADIE",
    "INSTRUCTION",
    "EXPIRE",
    "RENOUVELLEMENT",
  ])
  public statut!: string;

  @IsOptional()
  @ApiProperty({
    enum: [
      "NAME",
      "VALIDE",
      "RADIE",
      "REFUS",
      "PASSAGE",
      "TOUS",
      "INSTRUCTION",
      "ATTENTE_DECISION",
      "ID",
    ],
    type: String,
  })
  @IsIn([
    "NAME",
    "VALIDE",
    "RADIE",
    "REFUS",
    "PASSAGE",
    "TOUS",
    "INSTRUCTION",
    "ATTENTE_DECISION",
    "ID",
  ])
  public sortKey!: string;

  @IsOptional()
  @ApiProperty({
    enum: ["ascending", "descending"],
    type: String,
  })
  @IsIn(["ascending", "descending"])
  @ValidateIf((o) => typeof o.sortKey !== "undefined")
  @IsNotEmpty()
  public sortValue!: string;

  @ApiProperty({
    description: "Recherche par nom, prénom, custom id, ou ayant-droit",
    type: String,
  })
  @IsOptional()
  public name!: string;

  @ApiProperty({
    description: "Type d'échéance",
    enum: ["DEUX_MOIS", "DEUX_SEMAINES", "DEPASSEE"],
    type: String,
  })
  @IsIn(["DEUX_MOIS", "DEUX_SEMAINES", "DEPASSEE"])
  @IsOptional()
  public echeance!: string;

  @ApiProperty({
    description: "Date de dernier passage",
    enum: ["DEUX_MOIS", "TROIS_MOIS"],
    type: String,
  })
  @IsIn(["DEUX_MOIS", "TROIS_MOIS"])
  @IsOptional()
  public passage!: string;

  @ApiProperty({
    description: "Courrier ou colis en attente",
    enum: [
      "courrierIn",
      "courrierOut",
      "recommandeIn",
      "recommandeOut",
      "appel",
      "visite",
    ],
    type: String,
  })
  @IsOptional()
  @IsIn([
    "courrierIn",
    "courrierOut",
    "recommandeIn",
    "recommandeOut",
    "appel",
    "visite",
  ])
  public interactionType!: string;

  @ApiProperty({
    description: "Pagination",
    type: Number,
  })
  @IsOptional()
  public page!: number;
}
