import { IsIn, IsNotEmpty, IsOptional, IsEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DecisionDto {
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
  public statut!: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  public motif!: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  public motifDetails!: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  public orientation!: string;

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
  @IsIn(["RENOUVELLEMENT", "PREMIERE", "PREMIERE_DOM"])
  public typeDom!: string;
}
