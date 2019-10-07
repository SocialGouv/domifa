import { IsIn, IsNotEmpty, IsOptional } from "class-validator";

export class DecisionDto {
  @IsOptional()
  public dateDebut: Date;

  @IsOptional()
  public dateFin: Date;

  @IsOptional()
  public dateDecision: Date;

  @IsIn(["INSTRUCTION", "VALIDE", "ATTENTE_DECISION", "REFUS", "RADIE"])
  @IsNotEmpty()
  public statut: string;

  @IsOptional()
  public motif: string;

  @IsOptional()
  public motifDetails: string;

  @IsOptional()
  public orientation: string;

  @IsOptional()
  public orientationDetails: string;

  @IsOptional()
  public userId: number;

  @IsOptional()
  public userName: string;
}
