import { Transform, TransformFnParams } from "class-transformer";
import {
  IsDate,
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

import {
  UsagerDecisionStatut,
  UsagerDecisionMotif,
  UsagerDecisionOrientation,
  UsagerDecision,
  UsagerTypeDom,
} from "@domifa/common";
import { StripTagsTransform } from "../../../_common/decorators";

export class DecisionDto implements UsagerDecision {
  @IsIn(["INSTRUCTION", "VALIDE", "ATTENTE_DECISION", "REFUS", "RADIE"])
  @IsNotEmpty()
  public statut!: UsagerDecisionStatut;

  @ValidateIf((o) => o.statut === "VALIDE")
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : null;
  })
  public dateDebut!: Date;

  @ValidateIf(
    (o) => o.statut === "VALIDE" || o.statut === "REFUS" || o.statut === "RADIE"
  )
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : null;
  })
  public dateFin!: Date;

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

  @ValidateIf(
    (o) => (o.statut === "REFUS" || o.statut === "RADIE") && o.motif === "AUTRE"
  )
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  @StripTagsTransform()
  public motifDetails!: string;

  @ValidateIf((o) => o.statut === "REFUS")
  @IsNotEmpty()
  @IsIn(["asso", "ccas", "cias", "other"])
  public orientation!: UsagerDecisionOrientation;

  @ValidateIf((o) => o.statut === "REFUS")
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(1000)
  @IsString()
  @StripTagsTransform()
  public orientationDetails!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
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

  @IsEmpty()
  public typeDom!: UsagerTypeDom;
}
