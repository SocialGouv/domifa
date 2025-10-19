import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, ValidateIf } from "class-validator";
import {
  StructureDecisionStatut,
  StructureDecisionRefusMotif,
  StructureDecisionSuppressionMotif,
} from "@domifa/common";

export class UpdateStructureDecisionStatutDto {
  @ApiProperty({
    description: "Nouveau statut de la structure",
  })
  @IsEnum(["VALIDE", "REFUS", "SUPPRIME", "EN_ATTENTE"])
  statut: StructureDecisionStatut;

  @ApiProperty({
    description: "Motif détaillé en cas de refus ou suppression",
    enum: [
      ...Object.values(StructureDecisionRefusMotif),
      ...Object.values(StructureDecisionSuppressionMotif),
    ],
    example: StructureDecisionRefusMotif.COMPTE_EXISTANT,
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.statut === "REFUS" || o.statut === "SUPPRIME")
  @IsEnum([
    ...Object.values(StructureDecisionRefusMotif),
    ...Object.values(StructureDecisionSuppressionMotif),
  ])
  statutDetail?:
    | StructureDecisionRefusMotif
    | StructureDecisionSuppressionMotif;
}
