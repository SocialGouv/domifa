import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, ValidateIf } from "class-validator";
import {
  StructureDecisionStatut,
  StructureDecisionRefusMotif,
  StructureDecisionSuppressionMotif,
} from "@domifa/common";

export class UpdateStructureDecisionStatutDto {
  @ApiProperty({
    description: "Nouveau statut de la structure",
  })
  // SUPPRIME passe par l'endpoint dédié protégé par OTP — voir
  // deleteStructure() dans AdminStructuresController.
  @IsEnum(["VALIDE", "REFUS"])
  statut: StructureDecisionStatut;

  @ApiProperty({
    description: "Motif détaillé en cas de refus (requis si statut=REFUS)",
    enum: Object.values(StructureDecisionRefusMotif),
    example: StructureDecisionRefusMotif.COMPTE_EXISTANT,
  })
  // Aligné avec le front (Validators.required dans structure-form-refuse) :
  // pas de @IsOptional ici sinon il court-circuite la validation suivante.
  // ValidateIf seul saute @IsEnum quand statut!="REFUS" mais l'exige sinon.
  @ValidateIf((o) => o.statut === "REFUS")
  @IsEnum(Object.values(StructureDecisionRefusMotif))
  statutDetail?:
    | StructureDecisionRefusMotif
    | StructureDecisionSuppressionMotif;
}

export class DeleteStructureDto {
  @ApiProperty({
    description: "Motif de suppression",
    enum: Object.values(StructureDecisionSuppressionMotif),
    example: StructureDecisionSuppressionMotif.COMPTE_EXISTANT,
  })
  // Aligné avec le front (Validators.required dans structure-form-delete).
  @IsEnum(Object.values(StructureDecisionSuppressionMotif))
  motif: StructureDecisionSuppressionMotif;
}
