import { ApiProperty } from "@nestjs/swagger";
import { IsEmpty, IsIn, IsNotEmpty, IsOptional } from "class-validator";
import {
  UsagerDecision,
  UsagerDecisionMotif,
  UsagerDecisionOrientation,
  UsagerDecisionStatut,
  UsagerTypeDom,
} from "../../_common/model";

export class DecisionDto implements UsagerDecision {
  @ApiProperty({
    type: Date,
  })
  @IsOptional()
  public dateDebut!: Date;

  @ApiProperty({
    type: Date,
  })
  @IsOptional()
  public dateFin!: Date;

  @ApiProperty({
    type: Date,
  })
  @IsOptional()
  public dateDecision!: Date;

  @ApiProperty({
    type: String,
    required: true,
    enum: ["INSTRUCTION", "VALIDE", "ATTENTE_DECISION", "REFUS", "RADIE"],
  })
  @IsIn(["INSTRUCTION", "VALIDE", "ATTENTE_DECISION", "REFUS", "RADIE"])
  @IsNotEmpty()
  public statut!: UsagerDecisionStatut;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  public motif!: UsagerDecisionMotif;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  public motifDetails!: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  public orientation!: UsagerDecisionOrientation;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  public orientationDetails!: string;

  @IsEmpty()
  public userId!: number;

  @IsEmpty()
  public userName!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsIn(["RENOUVELLEMENT", "PREMIERE_DOM"])
  public typeDom!: UsagerTypeDom;
}
