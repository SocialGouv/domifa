import { IsBoolean, IsIn, IsNumber, IsOptional } from "class-validator";

export class SearchDto {
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
  @IsIn(["az", "za", "radiation", "domiciliation"])
  public sort!: string;

  @IsOptional()
  public name!: string;

  @IsIn(["DEUX_MOIS", "DEUX_SEMAINES", "DEPASSEE"])
  @IsOptional()
  public echeance!: string;

  @IsIn(["DEUX_MOIS", "TROIS_MOIS"])
  @IsOptional()
  public passage!: string;

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

  @IsNumber()
  @IsOptional()
  public id!: number;

  @IsOptional()
  public page!: number;
}
