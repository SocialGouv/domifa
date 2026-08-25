import { IsEnum } from "class-validator";
import {
  StructureDecisionStatut,
  StructureDecisionRefusMotif,
  StructureDecisionSuppressionMotif,
} from "@domifa/common";
import { ValidateIfElseNull } from "../../../_common/decorators";

export class UpdateStructureDecisionStatutDto {
  // SUPPRIME passe par l'endpoint dédié protégé par OTP — voir
  // deleteStructure() dans AdminStructuresController.
  @IsEnum(["VALIDE", "REFUS"])
  statut: StructureDecisionStatut;

  @ValidateIfElseNull((o) => o.statut === "REFUS")
  @IsEnum(Object.values(StructureDecisionRefusMotif))
  statutDetail?:
    | StructureDecisionRefusMotif
    | StructureDecisionSuppressionMotif;
}

export class DeleteStructureDto {
  // Aligné avec le front (Validators.required dans structure-form-delete).
  @IsEnum(Object.values(StructureDecisionSuppressionMotif))
  motif: StructureDecisionSuppressionMotif;
}
