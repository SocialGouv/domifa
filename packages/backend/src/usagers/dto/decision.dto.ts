import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsOptional,
  MinLength,
  ValidateIf,
} from "class-validator";
import {
  UsagerDecision,
  UsagerDecisionMotif,
  UsagerDecisionOrientation,
  UsagerDecisionStatut,
} from "../../_common/model";

export class DecisionDto implements UsagerDecision {
  @ApiProperty({
    type: String,
    required: true,
    enum: ["VALIDE", "ATTENTE_DECISION", "REFUS", "RADIE"],
  })
  @IsIn(["VALIDE", "ATTENTE_DECISION", "REFUS", "RADIE"])
  @IsNotEmpty()
  public statut!: UsagerDecisionStatut;

  @ApiProperty({
    type: Date,
  })
  @ValidateIf((o) => o.statut === "VALIDE")
  @IsNotEmpty()
  public dateDebut!: Date;

  @ApiProperty({
    type: Date,
  })
  @ValidateIf(
    (o) => o.statut === "VALIDE" || o.statut === "REFUS" || o.statut === "RADIE"
  )
  @IsNotEmpty()
  public dateFin!: Date;

  @ApiProperty({
    type: String,
  })
  @ValidateIf((o) => o.statut === "REFUS" || o.statut === "RADIE")
  @IsNotEmpty()
  public motif!: UsagerDecisionMotif;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  public motifDetails!: string;

  @ApiProperty({
    type: String,
  })
  @ValidateIf((o) => o.statut === "REFUS")
  @IsNotEmpty()
  @IsIn(["ccas", "asso", "other"])
  public orientation!: UsagerDecisionOrientation;

  @ApiProperty({
    type: String,
  })
  @ValidateIf((o) => o.typeDom === "REFUS")
  @IsNotEmpty()
  @MinLength(10)
  public orientationDetails!: string;

  @IsEmpty()
  public userId!: number;

  @IsEmpty()
  public userName!: string;

  @IsEmpty()
  public dateDecision!: Date;

  @ApiProperty()
  @IsOptional()
  public customRef!: string;
}
