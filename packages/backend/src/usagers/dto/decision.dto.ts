import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsDate,
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";

import {} from "../../_common/model";
import {
  UsagerDecisionStatut,
  UsagerDecisionMotif,
  UsagerDecisionOrientation,
  UsagerDecision,
} from "@domifa/common";
import { StripTagsTransform } from "../../_common/decorators";

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
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : null;
  })
  public dateDebut!: Date;

  @ApiProperty({
    type: Date,
  })
  @ValidateIf(
    (o) => o.statut === "VALIDE" || o.statut === "REFUS" || o.statut === "RADIE"
  )
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : null;
  })
  public dateFin!: Date;

  @ApiProperty({
    type: String,
  })
  @ValidateIf((o) => o.statut === "REFUS" || o.statut === "RADIE")
  @IsNotEmpty()
  @IsIn([
    "A_SA_DEMANDE",
    "PLUS_DE_LIEN_COMMUNE",
    "FIN_DE_DOMICILIATION",
    "NON_MANIFESTATION_3_MOIS",
    "NON_RESPECT_REGLEMENT",
    "ENTREE_LOGEMENT",
    "REFUS",
    "HORS_AGREMENT",
    "LIEN_COMMUNE",
    "SATURATION",
    "AUTRE",
  ])
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
  @IsIn(["asso", "ccas", "cias", "other"])
  public orientation!: UsagerDecisionOrientation;

  @ApiProperty({
    type: String,
  })
  @ValidateIf((o) => o.typeDom === "REFUS")
  @IsNotEmpty()
  @MinLength(10)
  @IsString()
  @StripTagsTransform()
  public orientationDetails!: string;

  @ApiProperty({
    example: "2020-1",
    required: false,
    description: "Id personnalisé",
  })
  @IsOptional()
  @IsString()
  @StripTagsTransform()
  public customRef!: string;

  @IsEmpty()
  public userId!: number;

  @IsEmpty()
  public userName!: string;

  @IsEmpty()
  public dateDecision!: Date;

  @IsEmpty()
  public uuid!: string;
}
