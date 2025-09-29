import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, ValidateIf } from "class-validator";
import {
  StructureStatut,
  StructureRefusMotif,
  StructureSuppressionMotif,
} from "@domifa/common";

export class UpdateStructureStatutDto {
  @ApiProperty({
    description: "Nouveau statut de la structure",
  })
  @IsEnum(["VALIDE", "REFUS", "SUPPRIME", "EN_ATTENTE"])
  statut: StructureStatut;

  @ApiProperty({
    description: "Motif détaillé en cas de refus ou suppression",
    enum: [
      ...Object.values(StructureRefusMotif),
      ...Object.values(StructureSuppressionMotif),
    ],
    example: StructureRefusMotif.COMPTE_EXISTANT,
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.statut === "REFUS" || o.statut === "SUPPRIME")
  @IsEnum([
    ...Object.values(StructureRefusMotif),
    ...Object.values(StructureSuppressionMotif),
  ])
  statutDetail?: StructureRefusMotif | StructureSuppressionMotif;
}
