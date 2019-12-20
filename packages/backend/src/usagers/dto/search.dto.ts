import { IsBoolean, IsIn, IsNumber, IsOptional } from "class-validator";

export class SearchDto {
  @IsOptional()
  public statut: string;

  @IsOptional()
  @IsIn(["az", "za", "radiation", "domiciliation"])
  public sort: string;

  @IsOptional()
  public name: string;

  @IsOptional()
  public echeance: string;

  @IsBoolean()
  @IsOptional()
  public interactionStatut: boolean;

  @IsOptional()
  @IsIn([
    "courrierIn",
    "courrierOut",
    "recommandeIn",
    "recommandeOut",
    "appel",
    "visite"
  ])
  public interactionType: string;

  @IsNumber()
  @IsOptional()
  public id: number;
}
